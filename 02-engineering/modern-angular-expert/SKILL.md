---
name: modern-angular-expert
title: 现代 Angular（v20+）开发专家
description: 当开发或升级到 Angular v20+、用 Signals/独立组件/Zoneless/SSR 水合重构时使用；做现代响应式模式落地并产出可构建测试的组件、服务与路由代码；不适用于 AngularJS(1.x) 迁移、无法升级的旧版应用或纯 TypeScript 问题；触发词：Signals、Standalone、Zoneless、SSR 水合、@defer、inject
domain: 研发/frontend
triggers: [Angular, Signals, 信号, computed, effect, Standalone 组件, 独立组件, Zoneless, 无 zone.js, SSR, 水合, Hydration, @defer, 增量水合, input() output() model(), inject(), OnPush, NgOptimizedImage, 函数式路由守卫, 信号状态服务, v20, v21, v22]
tags: [前端, frontend, Angular, Signals, 响应式, Standalone, Zoneless, SSR, Hydration, 状态管理, 性能优化, TypeScript]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write, Bash, Grep, Glob]
requires: []
related: [react-state-management, sveltekit-fullstack, typescript-advanced-types, shadcn-ui-components]
combines_with: [tailwind-css-patterns, tanstack-query, playwright-e2e-testing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于现代 Angular（v20+）开发与渐进升级，覆盖以下任务：

- 新建 Angular v20+ 应用，或为既有项目引入现代模式。
- 用 Signals（`signal`/`computed`/`effect`）实现细粒度响应式状态。
- 创建独立组件（Standalone），从 NgModule 迁移到直接 `imports`。
- 配置 Zoneless（去 zone.js）应用并调优变更检测。
- 实现 SSR、预渲染与（增量）水合。
- 函数式路由守卫/解析器、`inject()` 依赖注入、基于信号的状态服务与组件 Store。
- Angular 性能优化（OnPush、`@defer`、`NgOptimizedImage`）。

不该用边界：

- 从 AngularJS(1.x) 迁移 —— 改用 `angular-migration` 类技能。
- 无法升级、被锁死在旧大版本的遗留应用。
- 与框架无关的纯 TypeScript 问题 —— 改用 `typescript-expert` 类技能。

版本节奏参考：Angular 20（2025 Q2，Signals/Zoneless 稳定、增量水合）、21（2025 Q4，Signals 优先默认、增强 SSR）、22（2026 Q2，Signal Forms、无选择器组件）。

## 步骤 / 指令

1. 评估版本与结构：确认 Angular 版本、是否 Standalone、是否已启用 Zoneless/SSR，再决定改造范围。
2. 选对响应式原语：本地状态/派生值/副作用用 Signals；HTTP、事件流、复杂异步（`switchMap`/`mergeMap`）用 RxJS，需要桥接时用 `toSignal()`。
3. 落地现代写法：组件用 `standalone: true` + 直接 `imports`；输入输出用 `input()/output()/model()`；查询用 `viewChild/viewChildren/contentChild`；注入用 `inject()` 而非构造器。
4. 性能默认值：组件设 `ChangeDetectionStrategy.OnPush`，配合信号驱动变更检测；重组件用 `@defer` 懒加载，图片用 `NgOptimizedImage`。
5. 校验：跑构建与单元测试；Standalone 组件测试直接 `imports: [TheComponent]`，信号输入用 `componentRef.setInput(...)` 设置。
6. 安全演进：先在开发环境验证，存量应用渐进迁移，避免一次性大重构，过渡期保持向后兼容。

## 示例

信号 + 独立组件 + Zoneless 友好的计数器：

```typescript
import { Component, signal, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-counter",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="count">Count: {{ count() }}</div>
    <button (click)="increment()">+</button>
  `,
})
export class CounterComponent {
  count = signal(0);
  increment() {
    this.count.update((v) => v + 1); // 信号变更即触发 CD，无需 zone.js
  }
}
```

信号输入/输出/双向绑定：

```typescript
import { Component, input, output, model } from "@angular/core";

@Component({ selector: "app-user-card", standalone: true, template: `...` })
export class UserCardComponent {
  id = input.required<string>();
  name = input.required<string>();
  role = input<string>("User");      // 带默认值
  select = output<string>();
  isSelected = model(false);          // 双向绑定 [(isSelected)]
}
```

无 NgModule 引导 + Zoneless + 水合：

```typescript
// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
  ],
});

// app.config.ts —— 客户端水合（带事件重放）
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";
export const appConfig = { providers: [provideClientHydration(withEventReplay())] };
```

增量水合 + 懒加载（`@defer`）：

```html
<app-hero />
@defer (hydrate on viewport) { <app-comments /> }
@defer (hydrate on interaction) { <app-chat-widget /> }

@defer (on viewport) {
  <app-heavy-chart />
} @placeholder { <div class="skeleton"></div> }
  @loading (minimum 200ms) { <app-spinner /> }
  @error { <p>加载失败</p> }
```
水合触发器：`on idle`（浏览器空闲）/`on viewport`（进入视口）/`on interaction`（首次交互）/`on hover`（悬停）/`on timer(ms)`（延时）。

函数式守卫 + `inject()`：

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(["/login"], { queryParams: { returnUrl: state.url } });
};
```

信号状态服务（私有可写信号 + 只读 `computed` 暴露）：

```typescript
@Injectable({ providedIn: "root" })
export class StateService {
  private _user = signal<User | null>(null);
  private _notifications = signal<Notification[]>([]);
  readonly user = computed(() => this._user());
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);
  setUser(u: User | null) { this._user.set(u); }
  addNotification(n: Notification) { this._notifications.update((arr) => [...arr, n]); }
}
```

SSR 脚手架：`ng add @angular/ssr`。

## 注意事项

- Signals vs RxJS：本地状态、派生值、副作用优先 Signals；HTTP/事件流/复杂异步用 RxJS，跨界用 `toSignal()`。
- OnPush 在以下情况触发检查：输入信号/引用变化、事件处理器、async 管道发射、信号值变化。
- 模板里信号必须当函数调用（`count()` 而非 `count`），否则 UI 不更新。
- 推荐写法对照：状态用 Signals 而非滥用 RxJS；组件用 Standalone 而非臃肿 SharedModule；DI 用 `inject()` 而非冗长构造器注入；输入用 `input()` 而非 `@Input()` 装饰器；新项目启用 Zoneless（旧项目须先测试再开）。
- 常见排错：水合不一致 → 核对服务端/客户端内容一致性；循环依赖 → `inject()` 配合 `forwardRef`；Zoneless 不更新 → 用信号 `set/update` 而非直接 mutate 对象；SSR fetch 失败 → 用 `TransferState` 或 `withFetch()`。
- Signal Forms 为 v22+ 实验特性，当前生产仍以 Reactive Forms 为主。
- 本技能不替代环境内的实际验证、测试与专家评审；缺少必要输入、权限、安全边界或验收标准时应先停下确认。

## 互见

- `angular-migration`：AngularJS(1.x) 或旧大版本迁移。
- `typescript-expert`：与框架无关的纯 TypeScript 问题。
- 官方资源：Angular.dev、Signals 指南、SSR 指南、Update Guide。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
