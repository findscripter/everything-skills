---
name: odoo-automated-tests
title: Odoo 自动化测试
description: 当为 Odoo 自定义模块写/跑自动化测试时使用；做编写 TransactionCase 单元测试、HttpCase 控制器测试与 CLI/CI 执行命令；不适用于 JS tour 浏览器测试、Mock 外部服务（SMTP/支付）、跨事务 commit 数据隔离；触发词：odoo 测试、TransactionCase、HttpCase、--test-enable、test-tags
domain: 领域/erp
triggers: [Odoo 自动化测试, odoo 单元测试, TransactionCase, HttpCase, tour 测试, --test-enable, --test-tags, odoo-bin 跑测试, Odoo CI 测试, @odoo-automated-tests]
tags: [领域/ERP, Odoo, 自动化测试, Python, unittest, CI]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [TransactionCase, HttpCase, odoo-bin, unittest, pytest]
requires: []
related: [odoo-module-developer, odoo-orm-expert, odoo-rpc-api, odoo-migration-helper]
combines_with: [odoo-docker-deployment, odoo-module-developer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 为自定义模型的业务逻辑写单元测试（创建、状态流转、约束校验）。
- 验证控制器/路由端点（HTTP 状态码、登录鉴权、重定向）。
- 排查 CI 流水线中的测试失败，或配置 `--test-enable` 自动执行。

不该用（负边界）：
- JS tour 浏览器测试：需要真实浏览器（Chrome headless）与运行中的 Odoo 服务，本条不深入。
- Mock 外部服务：未覆盖 SMTP、支付网关等外部依赖的打桩。
- 跨事务数据隔离：隔离只在事务级，凡显式 `cr.commit()` 提交的数据会在用例间泄漏状态。
- 用生产库跑测试：永远另建专用测试库。

## 步骤

1. 在模块 `tests/` 目录建 `test_*.py`，并确保 `tests/__init__.py` 导入它。
2. 选基类：纯 Python 逻辑用 `TransactionCase`；控制器/路由用 `HttpCase`（更慢，仅用于路由验证）。
3. 打标签 `@tagged('post_install', '-at_install')`，在所有模块装好后再跑。
4. 共享测试数据放 `setUpClass`（Odoo 15+），它每类只跑一次，比 `setUp` 快得多。
5. 同时覆盖正常路径与错误路径（`ValidationError`/`AccessError`/`UserError`）。
6. 用 CLI 跑测试，按需用 `--test-tags` 缩小范围。

## 指令

```bash
# 跑某模块全部测试
./odoo-bin --test-enable --stop-after-init -d my_database -u hospital_management

# 仅跑指定标签
./odoo-bin --test-enable --stop-after-init -d my_database \
  --test-tags hospital_management

# 仅跑指定测试类
./odoo-bin --test-enable --stop-after-init -d my_database \
  --test-tags /hospital_management:TestHospitalPatient
```

## 示例

TransactionCase 单元测试（Odoo 15+ 写法）：

```python
# tests/test_hospital_patient.py
from odoo.tests.common import TransactionCase
from odoo.tests import tagged
from odoo.exceptions import ValidationError

@tagged('post_install', '-at_install')
class TestHospitalPatient(TransactionCase):

    @classmethod
    def setUpClass(cls):
        # setUpClass 每类只跑一次，性能优于 setUp
        super().setUpClass()
        cls.Patient = cls.env['hospital.patient']
        cls.doctor = cls.env['res.users'].browse(cls.env.uid)

    def test_create_patient(self):
        patient = self.Patient.create({'name': 'John Doe', 'doctor_id': self.doctor.id})
        self.assertEqual(patient.state, 'draft')

    def test_empty_name_raises_error(self):
        with self.assertRaises(ValidationError):
            self.Patient.create({'name': ''})

    def test_access_denied_for_other_user(self):
        # 用 with_user 测权限，不要 sudo()
        other_user = self.env.ref('base.user_demo')
        with self.assertRaises(Exception):
            self.Patient.with_user(other_user).create({'name': 'Test'})
```

HttpCase 控制器测试：

```python
from odoo.tests.common import HttpCase
from odoo.tests import tagged

@tagged('post_install', '-at_install')
class TestPatientController(HttpCase):

    def test_patient_page_authenticated(self):
        # 用 login 鉴权，不要硬编码密码
        self.authenticate(self.env.user.login, self.env.user.login)
        resp = self.url_open('/hospital/patients')
        self.assertEqual(resp.status_code, 200)

    def test_patient_page_redirects_unauthenticated(self):
        # 不调用 authenticate() = 匿名访问
        resp = self.url_open('/hospital/patients', allow_redirects=False)
        self.assertIn(resp.status_code, [301, 302, 403])
```

## 注意事项

- 优先 `setUpClass(cls)` + `cls.env`，大测试套件下显著更快。
- 始终带 `@tagged('post_install', '-at_install')`。
- 正常路径与异常路径都要测。
- 用 `self.with_user(user)` 测访问控制，避免 `sudo()` 掩盖权限问题。
- 不要依赖测试执行顺序：每个 `TransactionCase` 用例结束后会回滚、相互隔离。
- `HttpCase.authenticate()` 不要硬编码密码，用 `self.env.user.login` 或夹具用户。
- `HttpCase` 远慢于 `TransactionCase`，只在控制器/路由验证时用。

## 互见

- 领域/ERP 下其他 Odoo 模型与控制器开发条目。
- CI 流水线配置与测试库管理相关条目。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
