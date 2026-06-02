---
name: arm-cortex-firmware-expert
title: ARM Cortex-M 固件与驱动开发
description: 当为 ARM Cortex-M 系列单片机（Teensy 4.x、STM32 F4/F7/H7、nRF52、SAMD）编写固件、外设驱动或排查时序/内存一致性问题时使用；产出可编译的完整驱动模块（init/ISR/示例）、并发与 DMA 缓存方案、NVIC/临界区/HardFault 处理；不适用于纯应用层、桌面/服务器或非 Cortex-M 平台。触发词：Cortex-M、STM32、Teensy、DMA、HardFault
domain: 领域/hardware
triggers: [ARM Cortex-M 固件开发, STM32/Teensy/nRF52/SAMD 驱动, I2C/SPI/UART/ADC/DMA 外设驱动, Cortex-M7 内存屏障与缓存一致性, NVIC 中断优先级与临界区, HardFault 调试, DMA 缓存对齐与非缓存内存放置, FreeRTOS/Zephyr 嵌入式并发]
tags: [嵌入式, 固件, ARM-Cortex-M, STM32, Teensy, 驱动开发, DMA, RTOS, 硬件]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash, Grep]
requires: []
related: [kicad-design-reviewer, datasheet-spec-extractor, component-sourcing-search, spice-circuit-simulator]
combines_with: [datasheet-spec-extractor, gdb-debugging-cli, kicad-design-reviewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于为 ARM Cortex-M 单片机做固件与底层驱动开发：

- 目标平台：Teensy 4.x（i.MX RT1062 / Cortex-M7 600MHz，含 TCM/缓存/DMA）、STM32（F4/F7/H7，HAL/LL，CubeMX）、nRF52（Cortex-M4，BLE，nRF SDK/Zephyr）、SAMD（M0+/M4，Arduino/裸机）。
- 编写寄存器级或 HAL 级外设驱动（I2C/SPI/UART/CAN/SDIO/ADC/DAC/PWM/USB）、中断驱动的非阻塞数据管道、DMA 高吞吐传输。
- 设计软件架构：分层、HAL 抽象、ISR 安全、内存管理、协作/抢占式调度（FreeRTOS/Zephyr/裸机）。
- 排查 Cortex-M7 弱序内存/缓存一致性、HardFault、栈溢出、中断优先级反转等问题。

不该用边界（应改用其他技能/方法）：

- 任务与 Cortex-M 固件无关，或属于纯应用层、桌面/服务器、Linux 用户态开发。
- 平台不是 Cortex-M（如 RISC-V、x86、AVR 8 位、Cortex-A 跑 OS）。
- 缺少目标平台、外设类型、协议参数（速率/模式/包长）等关键输入时，先澄清再动手，不要臆造硬件细节。

## 步骤

1. 澄清需求：目标平台、外设类型、协议细节（时钟速率、模式、位序、包大小、是否需 DMA/RTOS）。
2. 设计驱动骨架：常量、寄存器/结构体定义、编译期配置（模板/constexpr）。
3. 实现核心：`init()`、ISR 处理函数、环形缓冲/事件队列逻辑、面向用户的 API。
4. 验证：给出示例用法，并标注时序、延迟、吞吐特性。
5. 优化：按需引入 DMA、调整中断优先级、拆分 RTOS 任务（先 profile 再优化）。
6. 迭代：根据真实硬件反馈给出改进版本。

## 指令

工作原则：

- 正确性优先于性能；先保证功能，profile 后再优化。
- 交付完整方案（init + ISR + 示例用法），不要只给片段。
- 注释寄存器用途、缓冲结构、ISR 流程。
- 默认安全：防缓冲区溢出、阻塞调用、优先级反转、缺失内存屏障。
- 记录权衡：阻塞 vs 异步、RAM vs Flash、吞吐 vs CPU 负载。

Cortex-M7（Teensy 4.x、STM32 F7/H7）安全关键约束：

- 弱序内存 MMIO：M7 会重排寄存器读写。C/C++ 读前后用 `__DMB()`，写后用 `__DSB()`，封装 `mmio_read()/mmio_write()/mmio_modify()`；Rust 用 `cortex_m::asm::dmb()/dsb()` 配合 `safe_read_reg!()/safe_write_reg!()` 宏。缺屏障的典型症状：加了调试打印就好、关了就坏；优化级别变化导致间歇失败；读到陈旧寄存器值。
- DMA 与缓存一致性（M7 有 D-cache，CPU 与 DMA 可能看到不同数据）：
  - 所有 DMA 缓冲区必须 32 字节对齐（缓存行大小），大小为 32 字节整数倍，否则缓存失效会破坏相邻内存。
  - 内存放置优先级（优→劣）：① 放 DTCM/SRAM 非缓存区（CPU 访问最快）；② MPU 配置 OCRAM/SRAM 为非缓存区；③ 最后才用缓存维护：DMA 读内存前 `arm_dcache_flush_delete()` / `clean_dcache_by_range()`，DMA 写内存后 `arm_dcache_delete()` / `invalidate_dcache_by_range()`。
- W1C 寄存器：i.MX RT、STM32 多数状态寄存器（`USBSTS`、`PORTSC`、CCM 状态）写 1 清除，`status &= ~bit` 无效。
- 调试期可用 `is_valid_mmio_address(addr)` 校验外设地址范围（外设 0x40000000–0x4FFFFFFF，系统外设 0xE0000000–0xE00FFFFF），`#ifdef DEBUG` 守护并在非法地址处停机。

中断与并发：

- NVIC：数字越小优先级越高；同优先级 ISR 不可互相抢占。M0/M0+ 仅 2–4 级，M3/M4/M7 为 8–256 级。最高优先级（0–2）留给时间关键操作（DMA/定时器），中段（3–7）给常规外设，低段（8+）给后台任务。配置：`NVIC_SetPriority()` / `HAL_NVIC_SetPriority()`，Rust 用 `NVIC::set_priority()`。
- 临界区要短（微秒级）。优先 BASEPRI 而非 PRIMASK（允许高优先级 ISR 继续运行）；能用原子操作就别关中断。
- Rust 禁用 `static mut`（数据竞争 UB），改用 `AtomicBool` 或 `Mutex<RefCell<Option<T>>>` + `critical_section::with(...)`。原子序：`Relaxed`（仅 CPU）/`Acquire-Release`（共享态）/`AcqRel`（CAS）/`SeqCst`（少用）。

平台陷阱：

- 电压：多数平台 GPIO 上限 3.3V（除 STM32 FT 引脚外不耐 5V），5V 接口加电平转换；查数据手册电流上限（约 6–25mA）。
- Teensy 4.x：FlexSPI 专用于 Flash/PSRAM；EEPROM 为模拟（写频率 <10Hz）；LPSPI 上限 30MHz；外设激活时勿改 CCM 时钟。
- STM32 F7/H7：每外设独立时钟域；DMA 流/通道分配固定；GPIO 速度影响压摆率/功耗。
- nRF52：SAADC 上电后需校准；GPIOTE 仅 8 通道；Radio 共享优先级。
- SAMD：SERCOM 需谨慎引脚复用；GCLK 路由关键；M0+ 变体 DMA 受限。

HardFault 调试（M3/M4/M7）：查 `HFSR` 判故障类型、`CFSR` 看细因、`MMFAR`/`BFAR` 看出错地址，检查栈帧 `R0-R3, R12, LR, PC, xPSR`。常见原因：非对齐访问（尤其 M0/M0+）、空指针、栈溢出、非法指令、写只读/非法外设地址。M0/M0+ 故障信息有限（无 CFSR/MMFAR/BFAR）。建议在 HardFault handler 里捕获并打印栈帧后再复位。

栈溢出防护：① MPU 守护页（最佳，在栈下方设不可访问区，触发 MemManage 故障）；② Canary 值（如 `0xDEADBEEF` 置于栈底周期性检查，可移植）；③ 看门狗（间接超时检测 + 恢复）。

FPU 上下文：M4F/M7F 默认惰性压栈，仅 ISR 用 FPU 时才保存 S0-S15/FPSCR；硬实时或 ISR 必用 FPU 时清 `FPU->FPCCR` 的 LSPEN 位以获得确定性延迟。

## 示例

非阻塞 SPI 外部传感器驱动（基于事务的读写）：配置时钟速率/模式/位序 → 控制 CS 引脚时序 → 抽象寄存器读写 → 如 `sensorReadRegister(0x0F)` 读 WHO_AM_I；吞吐 >500kHz 时改用 DMA。

平台 API：

- Teensy 4.x：`SPI.beginTransaction(SPISettings(speed, order, mode))` → `SPI.transfer(data)` → `SPI.endTransaction()`
- STM32：`HAL_SPI_Transmit()` / `HAL_SPI_Receive()` 或 LL 驱动
- nRF52：`nrfx_spi_xfer()` 或 `nrf_drv_spi_transfer()`
- SAMD：`SERCOM_SPI_MODE_MASTER` 配置 SERCOM 为 SPI 主机

W1C 清状态示例（C/C++）：

```cpp
uint32_t status = mmio_read(&USB1_USBSTS);
mmio_write(&USB1_USBSTS, status);  // 写回置位以清除
```

Rust 共享状态（禁 static mut）：

```rust
static READY: AtomicBool = AtomicBool::new(false);
static STATE: Mutex<RefCell<Option<T>>> = Mutex::new(RefCell::new(None));
// 访问：critical_section::with(|cs| STATE.borrow_ref_mut(cs))
```

## 注意事项

- 本技能输出不能替代真机验证、测试与专家评审，务必在目标硬件上回归。
- 关键输入（平台、外设、协议参数、安全边界、成功标准）缺失时停下来澄清，勿假设硬件行为。
- Cortex-M 架构差异要点：M0/M0+ 无 FPU/Cache/TCM、故障信息有限、仅 Thumb-1；M4F 单精度 FPU；M7F 单/双精度 FPU + I/D-Cache + ITCM/DTCM；M3 起才有 DWT 与完整故障寄存器。
- 32 字节对齐与非缓存内存放置是 M7 上 DMA 正确性的高频坑，优先用 DTCM 而非事后缓存维护。

## 互见

- 领域/hardware 下其他嵌入式与底层驱动技能。
- RTOS（FreeRTOS/Zephyr）任务调度与同步原语相关技能。
- 协议栈（BLE、USB CDC/MSC/HID、MIDI、CAN）实现相关技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
