---
name: angularjs-to-angular-migration
title: AngularJS 到 Angular 迁移
description: 当把 AngularJS(1.x) 应用迁移到现代 Angular(2+) 时使用；用 ngUpgrade 搭建混合应用、按特性渐进迁移 controller/directive/service/路由/表单并安全切换，产出可运行的 Angular 代码与迁移计划；不适用于已是现代 Angular 版本、或不涉及框架升级的小修。触发词：AngularJS 迁移、ngUpgrade、hybrid app、downgradeInjectable
domain: 研发/frontend
triggers: [AngularJS 迁移到 Angular, ngUpgrade 混合应用, downgradeInjectable / upgrade, 把 controller/directive 改成 Angular 组件, $scope 重写为组件, $routeProvider 迁移到 RouterModule]
tags: [angular, angularjs, 迁移, ngupgrade, 前端, 重构]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Angular CLI, ngUpgrade, TypeScript, RxJS]
requires: []
related: [modern-angular-expert, legacy-codebase-modernizer, zero-downtime-migration-architect, typescript-advanced-types]
combines_with: [modern-angular-expert, legacy-codebase-modernizer, frontend-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于：

- 把 AngularJS(1.x) 应用迁移到 Angular(2+)
- 运行 AngularJS / Angular 并存的混合（hybrid）应用
- 把 controller、directive 转换为 Angular 组件
- 把 factory/service 现代化为 `@Injectable` 服务
- 把 `$routeProvider`/`ui-router` 迁移到 `RouterModule`
- 把 `ng-model` 表单迁移到模板驱动 / 响应式表单
- 升级到最新 Angular 版本并落地最佳实践

不该用（负边界）：

- 任务与「从 AngularJS 迁移到 Angular」无关
- 应用已在现代 Angular 版本上，无框架升级诉求
- 只需一个不涉及框架改动的小 UI 修复

## 步骤

1. **评估**：盘点 AngularJS 代码库、第三方依赖与迁移风险。
2. **选策略**并定里程碑：
   - **大爆炸（整体重写）**：并行开发、一次性切换。适合小应用 / 全新项目。
   - **渐进（混合）**：AngularJS 与 Angular 并存，逐特性迁移，靠 ngUpgrade 互操作。适合大应用 / 持续交付。
   - **垂直切片**：一次彻底迁移一个特性，新特性用 Angular、旧的保留 AngularJS，逐步替换。适合中等应用。
3. **搭混合应用**：配置 ngUpgrade，迁移模块、组件与路由。
4. **验证与切换**：用测试校验，规划可回滚的安全切换。

推荐迁移顺序：先服务 → 工具/共享组件 → 路由 → 逐特性 → 清理（移除 AngularJS 与 ngUpgrade，优化打包）。

## 指令

混合应用引导（main.ts + app.module.ts）：

```typescript
// main.ts - 引导混合应用
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { UpgradeModule } from '@angular/upgrade/static';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(platformRef => {
    const upgrade = platformRef.injector.get(UpgradeModule);
    upgrade.bootstrap(document.body, ['myAngularJSApp'], { strictDi: true });
  });
```

```typescript
// app.module.ts
@NgModule({ imports: [BrowserModule, UpgradeModule] })
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}
  ngDoBootstrap() { /* 在 main.ts 中手动引导 */ }
}
```

跨框架依赖注入（互操作核心）：

```typescript
// Angular 服务 → 供 AngularJS 使用：downgradeInjectable
import { downgradeInjectable } from '@angular/upgrade/static';
angular.module('myApp').factory('newService', downgradeInjectable(NewService));

// AngularJS 服务 → 供 Angular 使用：InjectionToken + $injector
export const OLD_SERVICE = new InjectionToken<any>('oldService');
@NgModule({
  providers: [{
    provide: OLD_SERVICE,
    useFactory: (i: any) => i.get('oldService'),
    deps: ['$injector']
  }]
})
// 注入：constructor(@Inject(OLD_SERVICE) private oldService: any) {}
```

## 示例

**Controller → 组件**：`$scope` 字段变为类属性，`$scope.xxx = function` 变为类方法，`.then()` 改为 `subscribe()`，在 `ngOnInit` 中初始化。

**Directive → 组件**：`scope: { user: '=' }` → `@Input() user`；`onDelete: '&'` → `@Output() delete = new EventEmitter<void>()`；模板里 `ng-click="onDelete()"` → `(click)="delete.emit()"`。

**Service**：`factory + $http` → `@Injectable({ providedIn: 'root' })` + `HttpClient`，返回 `Observable`：

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}
  getUser(id: number): Observable<any> { return this.http.get(`/api/users/${id}`); }
  saveUser(user: any): Observable<any> { return this.http.post('/api/users', user); }
}
```

**路由**：`$routeProvider.when('/users/:id', {...})` → `Routes` 数组 `{ path: 'users/:id', component: UserDetailComponent }`，由 `RouterModule.forRoot(routes)` 注册。

**表单**：`ng-model` + `userForm.$invalid` → 模板驱动 `[(ngModel)]` + `#userForm="ngForm"` + `userForm.invalid`；复杂表单优先用响应式表单 `FormBuilder` + `Validators`。

## 注意事项

- 不要在无回滚、无预发验证的情况下做一次性大爆炸切换。
- 渐进迁移期间持续做混合兼容性测试。
- 常见坑：混合应用配置不正确；先迁 UI 后迁逻辑（应反过来，先逻辑）；忽视变更检测差异；scope 处理不当；AngularJS 与 Angular 模式混用；测试不充分。
- 最佳实践：先迁服务（最易）；逐特性渐进；每步都测；尽早转 TypeScript；从第一天起遵循 Angular 风格指南；先跑通再优化；保留迁移笔记。
- 本技能输出不能替代针对具体环境的验证、测试与专家评审；若缺少必要输入、权限、安全边界或成功标准，应先停下来澄清。

## 互见

- 混合模式模式、组件转换、DI 迁移、路由迁移等可在源仓库 `references/` 与 `assets/`（如 `hybrid-bootstrap.ts`）、`scripts/analyze-angular-app.sh` 中进一步查阅。
- 研发/misc 域下其他「框架升级 / 大型重构」类技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
