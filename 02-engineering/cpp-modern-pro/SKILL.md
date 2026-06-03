---
name: cpp-modern-pro
title: 现代 C++ RAII 与 STL 惯用法
description: 当用 C++11/14/17/20/23 编写或重构代码、需要内存安全与高性能时使用；产出符合 Core Guidelines 的惯用代码、CMakeLists、单测与基准、Sanitizer 干净输出；不适用于 C 语言、嵌入式裸机或非 C++ 任务。触发词：现代 C++、RAII、智能指针、移动语义、STL 算法、模板
domain: 研发/backend
triggers: [现代 C++, RAII, 智能指针, unique_ptr, shared_ptr, 移动语义, 完美转发, STL 算法, 模板元编程, concepts, const 正确性, constexpr, Rule of Five, 异常安全, AddressSanitizer, Google Test, Catch2, Google Benchmark]
tags: [c++, 研发, raii, stl, 智能指针, 模板, 并发, 性能优化, 现代c++]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cmake, g++/clang++, AddressSanitizer, ThreadSanitizer, Google Test, Catch2, Google Benchmark, perf, VTune]
requires: []
related: [gdb-debugging-cli, rust-pro, c-cpp-security-review, unreal-engine-cpp]
combines_with: [gdb-debugging-cli, c-cpp-security-review, bug-hunter]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用现代 C++（C++11/14/17/20/23）编写或重构代码，追求惯用、类型安全与高性能。
- 涉及内存管理、生命周期、资源管理（文件/锁/句柄）、移动语义、模板与并发的设计取舍。
- 需要配套 CMakeLists、单元测试、Sanitizer 验证与性能基准。

不该用（负边界）：
- 任务与 C++ 无关，或是纯 C 语言、嵌入式裸机/无标准库环境。
- 需要其他领域或本范围之外的工具链。
- 缺少必要输入（目标、约束、平台/编译器、成功标准）时，先停下来澄清，不要臆测。

## 步骤

1. 澄清目标、约束与输入：C++ 标准版本、目标平台/编译器、性能或安全指标。
2. 优先栈分配与 RAII，避免手工 new/delete 管理内存。
3. 确需堆分配时使用智能指针：独占用 `unique_ptr`，共享所有权才用 `shared_ptr`。
4. 遵循 Rule of Zero/Three/Five：能不写特殊成员函数就不写（Rule of Zero 优先）。
5. 贯彻 const 正确性，能编译期求值的用 `constexpr`；C++20 起用 concepts 约束模板。
6. 用 STL 算法替代裸循环（`std::transform`/`std::accumulate`/`ranges` 等）。
7. 移动语义与完美转发：转移所有权用 `std::move`，转发引用用 `std::forward`。
8. 并发用 `std::thread`/`std::atomic`/`std::mutex`，明确异常安全保证（基本/强/不抛）。
9. 用 perf、VTune 做性能剖析后再优化，避免凭感觉调优。
10. 交付前用 ASan/TSan 跑出干净输出，并补单测与基准。

## 指令

- 偏向编译期错误而非运行期错误：优先 concepts、`static_assert`、类型约束在编译期拦截问题。
- 遵循 C++ Core Guidelines。
- 头文件用 `#pragma once` 或规范的 include guard。
- CMakeLists 显式指定 C++ 标准（如 `set(CMAKE_CXX_STANDARD 20)` 与 `CMAKE_CXX_STANDARD_REQUIRED ON`）。
- 单测用 Google Test 或 Catch2；基准用 Google Benchmark。
- 为模板接口写清晰文档（约束、要求、复杂度）。
- 输出不能替代环境内的实测、测试与专家评审。

## 示例

智能指针与 RAII（独占所有权，Rule of Zero）：

```cpp
#include <memory>
#include <vector>

struct Widget {
    explicit Widget(int id) : id_(id) {}
    int id_;
};

// 优先栈/容器管理生命周期，无需手写析构
std::vector<std::unique_ptr<Widget>> make_widgets() {
    std::vector<std::unique_ptr<Widget>> v;
    v.push_back(std::make_unique<Widget>(1));
    return v; // 移动返回，零拷贝
}
```

STL 算法替代裸循环：

```cpp
#include <numeric>
#include <vector>

long long sum_squares(const std::vector<int>& xs) {
    return std::accumulate(xs.begin(), xs.end(), 0LL,
        [](long long acc, int x) { return acc + 1LL * x * x; });
}
```

CMake 与 Sanitizer（开发期开启 ASan）：

```cmake
cmake_minimum_required(VERSION 3.16)
project(demo CXX)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_compile_options(-Wall -Wextra)
# 调试构建开启地址消毒器
add_compile_options($<$<CONFIG:Debug>:-fsanitize=address>)
add_link_options($<$<CONFIG:Debug>:-fsanitize=address>)
```

## 注意事项

- 不要默认用 `shared_ptr`：引用计数有开销且易掩盖所有权设计问题，只有真正共享所有权时才用。
- 警惕悬垂引用：返回局部变量引用、lambda 按引用捕获后逃逸作用域。
- 移动后对象处于有效但未指定状态，移动后不要再读其值。
- `std::forward` 仅对转发引用（`T&&` 配合模板推导）使用，不要乱用。
- 并发下注意数据竞争，TSan 干净不等于逻辑正确；锁与原子要配合异常安全。
- 编译期检查（concepts/static_assert）优先于运行期断言。

## 互见

- 性能剖析工具链（perf、VTune、Google Benchmark）的深入用法。
- 单元测试框架（Google Test / Catch2）实践。
- C++ Core Guidelines 与 Sanitizer（ASan/TSan/UBSan）使用规范。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
