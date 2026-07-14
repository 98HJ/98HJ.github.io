# -*- coding: utf8 -*-
"""
腾讯云 SCF 计数器 - 零依赖·本地文件版(函数 URL 部署)
无需 COS,无需 Layer,无需 SDK。数据存在 SCF 的临时磁盘 (/tmp) 中。

部署方式(腾讯云控制台):
  1. 新建「函数」→ 运行环境 Python 3.10 → 提交方式「在线编辑」→ 粘贴本文件。
  2. 函数代码的「执行方法」保持默认:index.main_handler(本文件需命名为 index.py,
     或把本文件内容放到 index.py 中,保证入口是 main_handler)。
  3. 在「函数 URL」页:创建函数 URL,选择「启用」,鉴权选「无」(公开),
     高级设置里打开 CORS(允许 Origin * / 方法 GET,POST,OPTIONS / 头部 *)。
  4. 拿到函数 URL,形如 https://<id>-<ns>.ap-shanghai.tencentscf.com,
     填进前端 js/main.js 的 COUNTER_API(作为 ?key=... 的 base)。

接口:GET/POST {URL}?key=KEY[&delta=N]  →  返回 {"value":数字}

⚠️ 局限:/tmp 是单实例临时盘,实例冷启动或多实例并发时计数会重置为 0。
   若需要持久计数,改用 deploy/tencent-scf-counter.py(COS 存储版)。
"""

import json
import os

# SCF 的临时磁盘目录,每次调用都可读写
TMP_DIR = "/tmp/counter"
if not os.path.exists(TMP_DIR):
    os.makedirs(TMP_DIR)

def _file_path(key):
    # 文件名只保留安全字符
    safe = "".join(c for c in key if c.isalnum() or c in "-_")
    return os.path.join(TMP_DIR, f"{safe or 'default'}.txt")

def _read(key):
    try:
        with open(_file_path(key), 'r') as f:
            return int(f.read().strip() or "0")
    except Exception:
        return 0

def _write(key, val):
    with open(_file_path(key), 'w') as f:
        f.write(str(val))

def main_handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "*",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    qs = event.get("queryString", {}) or {}
    key = qs.get("key", "default")
    try:
        delta = int(qs.get("delta", "0"))
    except Exception:
        delta = 0

    try:
        v = _read(key)
        if delta != 0:
            v = max(0, v + delta)
            _write(key, v)
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"value": v}),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)}),
        }
