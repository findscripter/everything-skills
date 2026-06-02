---
name: binary-analysis-patterns
title: 二进制逆向与汇编分析模式
description: 当逆向编译后的二进制、读 x86-64/ARM 反汇编或还原程序逻辑（变量、结构体、函数签名、控制流）时使用；做汇编模式识别与 Ghidra/IDA 脚本辅助，产出还原的伪代码/类型/标注；不适用于源码可得、动态调试取值或纯漏洞利用编写。触发词：反汇编、汇编、Ghidra、IDA、调用约定、反编译
domain: 安全/appsec
triggers: [反汇编, 汇编分析, 二进制逆向, Ghidra, IDA Pro, IDAPython, 调用约定, 反编译, 函数序言, 栈帧, 结构体还原, x86-64, ARM64, AArch64, 跳转表, 类型还原]
tags: [安全, 逆向工程, 二进制分析, 汇编, 反编译, x86-64, ARM, Ghidra, IDA, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Ghidra, IDA Pro, IDAPython, objdump, readelf]
requires: []
related: [anti-reversing-techniques, firmware-reverse-analyst, constant-time-analyzer, yara-rule-authoring]
combines_with: [anti-reversing-techniques, gdb-debugging-cli, yara-rule-authoring]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 面对编译后的二进制（无源码或源码不可信），需读懂 x86-64 / ARM 反汇编。
- 还原程序逻辑：局部变量、数组、结构体、函数签名、控制流（if/循环/switch）。
- 识别常见算法实现（strlen/strcpy/memcpy、乘除优化、位运算）。
- 用 Ghidra/IDAPython 脚本批量改善反编译结果或定位危险调用。

不该用（负边界）：
- 有可信源码可直接读时。
- 需要运行时取值、下断点、跟踪实际数据流——那是动态调试（gdb/x64dbg）的范畴。
- 编写漏洞利用 PoC、堆喷、ROP 链构造——本技能只做静态识别，不覆盖利用开发。
- 与逆向无关的任务。

## 步骤

1. 初步分流：文件类型、架构（x86-64/ARM32/ARM64）、导入/导出表。
2. 字符串分析：提取可疑字符串、错误信息、格式串，作为命名线索。
3. 函数识别：入口点、导出函数、交叉引用（xref）。
4. 控制流梳理：用下方模式还原 if/循环/switch 结构。
5. 数据结构还原：依据访问偏移与宽度推断 struct/数组/全局。
6. 算法识别：加解密、哈希、压缩、字符串操作。
7. 文档化：加注释、重命名符号、应用类型定义。

## 指令

- 先明确目标、约束与已知输入（架构、平台、是否带符号）。
- 按宽度推断类型：1 字节→char/bool，2 字节→short，4 字节→int/float，8 字节→long/double/指针。`movzx` 零扩展（无符号），`movsx` 符号扩展（有符号）。
- 按寄存器推断参数（见调用约定），按函数末尾 RAX/X0 推断返回值。
- 警惕优化产物：内联、尾调用（`jmp` 代替 `call`+`ret`）、死代码、PIC 的 RIP 相对寻址——反编译结构未必对应源码结构。
- 复杂示例与脚本，参考源仓库 `resources/implementation-playbook.md`。

### 调用约定速查

- System V AMD64（Linux/macOS）：参数 RDI, RSI, RDX, RCX, R8, R9，余者入栈；返回 RAX（128 位用 RDX）。被调用者保存：RBX, RBP, R12-R15。
- Microsoft x64（Windows）：参数 RCX, RDX, R8, R9，余者入栈；栈上预留 32 字节 shadow space；返回 RAX。
- ARM64（AArch64）：参数 X0-X7，返回 X0；帧指针 X29，链接寄存器 X30。
- ARM32：参数 R0-R3 余者入栈，返回 R0；链接寄存器 LR(R14)。

## 示例

函数序言/收尾（x86-64）：
```asm
; 标准序言
push rbp           ; 保存基址指针
mov rbp, rsp       ; 建立栈帧
sub rsp, 0x20      ; 分配局部变量
; 标准收尾
leave              ; 等价于 mov rsp, rbp; pop rbp
ret
```

ARM64 序言/收尾：
```asm
stp x29, x30, [sp, #-16]!  ; 保存 FP 和 LR
mov x29, sp                 ; 设置帧指针
; ...
ldp x29, x30, [sp], #16    ; 恢复 FP 和 LR
ret
```

控制流——for 循环与跳转表 switch：
```asm
; for (int i = 0; i < n; i++)
xor ecx, ecx           ; i = 0
loop_start:
cmp ecx, [n]
jge loop_end
; ... 循环体 ...
inc ecx
jmp loop_start
loop_end:

; switch 跳转表
mov eax, [switch_var]
cmp eax, max_case
ja default_case
jmp [jump_table + eax*8]
```

数据结构——数组与结构体访问（偏移即字段）：
```asm
mov eax, [rbx + rcx*4]   ; array[i]，4 字节元素，rbx=基址 rcx=索引
; struct { int a@0; char b@4; long c@8; short d@16; }
mov eax, [rdi]           ; s->a
movzx eax, byte [rdi+4]  ; s->b
mov rax, [rdi+8]         ; s->c
movzx eax, word [rdi+16] ; s->d
```

算术优化识别：
```asm
lea eax, [rax + rax*2]   ; x * 3
lea eax, [rax + rax*4]   ; x * 5
and eax, 7               ; x % 8（2 的幂取模）
sar eax, 3               ; 有符号除以 8（配合 cdq 修正负数）
```

Ghidra 脚本——定位危险调用：
```python
for func in currentProgram.getFunctionManager().getFunctions(True):
    for ref in getReferencesTo(func.getEntryPoint()):
        if func.getName() in ["strcpy", "sprintf", "gets"]:
            print(f"Dangerous call at {ref.getFromAddress()}")
```

IDAPython——查找对某函数的调用：
```python
import idautils, idc
def find_calls(func_name):
    for func_ea in idautils.Functions():
        for head in idautils.Heads(func_ea, idc.find_func_end(func_ea)):
            if idc.print_insn_mnem(head) == "call":
                target = idc.get_operand_value(head, 0)
                if idc.get_func_name(target) == func_name:
                    print(f"Call to {func_name} at {hex(head)}")
```

## 注意事项

- 优化产物会破坏「汇编结构对应源码结构」的直觉：内联展开、尾调用优化、死代码消除、PIC 的 RIP 相对寻址都会误导判断。
- 跳转表的元素宽度（`*8` vs `*4`）和上界 `ja default_case` 的检查是识别 switch 的关键。
- 叶函数（无调用）可能省略帧指针，仅 `sub rsp` 分配局部，不要据此误判非函数边界。
- 本技能产出是静态推断，必须以实际反汇编工具的交叉验证为准，勿当作可执行结论；缺少架构/平台/输入信息时先澄清。

## 互见

- 动态调试与运行时取值（gdb/x64dbg）。
- 危险函数命中后的漏洞利用开发（另属利用编写范畴，本技能不覆盖）。
- 安全/misc 域内的恶意样本分析与算法识别。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
