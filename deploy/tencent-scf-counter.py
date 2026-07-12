# -*- coding: utf8 -*-
"""
腾讯云 SCF 全局计数器 (点赞 / PV / UV)
======================================
配合 API 网关使用,前端通过以下接口读写:
  GET  {网关}/counter?key=likes        -> {"value": N}     读
  POST {网关}/counter?key=likes&delta=1 -> {"value": N}     +delta 写回

特性:
  - 计数文件存于 COS(对象存储),每个 key 一个 txt,内容为数字字符串
  - SCF Python 运行时**内置** qcloud_cos SDK,无需打包依赖
  - 已开启 CORS,浏览器可直接 fetch
  - 个人站流量下并发竞态可忽略;如需强一致可加 Redis(见文末备注)

部署步骤(详见下方注释 / 对话说明):
  1. 建 COS 桶(标准存储,私有读写即可),记下 桶名 / 地域
  2. 建 SCF(Python3),粘贴本文件,配置环境变量
     TENCENT_SECRET_ID / TENCENT_SECRET_KEY / COS_BUCKET / COS_REGION
  3. 创建 API 网关服务 -> 新建 API(POST/GET, 路径 /counter, 后端指向该 SCF)
     -> 发布到 "release" 环境,拿到网关 base URL 填进前端 COUNTER_API
"""

from qcloud_cos import CosConfig, CosS3Client
import json
import os

_secret_id = os.environ.get("TENCENT_SECRET_ID", "")
_secret_key = os.environ.get("TENCENT_SECRET_KEY", "")
_bucket = os.environ.get("COS_BUCKET", "")        # 例: jianhua-counter-1250000000
_region = os.environ.get("COS_REGION", "ap-guangzhou")

_config = CosConfig(Region=_region, SecretId=_secret_id, SecretKey=_secret_key)
_client = CosS3Client(_config)


def _obj_key(key):
    # 只保留安全字符,防止路径穿越
    safe = "".join(c for c in key if c.isalnum() or c in "-_")
    return "counter/" + (safe or "default") + ".txt"


def _read(key):
    try:
        resp = _client.get_object(Bucket=_bucket, Key=_obj_key(key))
        body = resp["Body"].get_raw_stream().read().decode("utf-8").strip()
        return int(body or "0")
    except Exception:
        return 0  # 对象不存在 -> 视为 0


def _write(key, val):
    _client.put_object(Bucket=_bucket, Key=_obj_key(key), Body=str(val))


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


# ---- 备注:若改为 Redis 强一致计数(需购买 TencentDB for Redis) ----
# import redis
# r = redis.StrictRedis(host=os.environ['REDIS_HOST'], port=6379, password=os.environ['REDIS_PWD'])
# def _read(key): return int(r.get(key) or 0)
# def _write(key, val): r.set(key, val)
# # INCR/DECR 天然原子,无需 max(0, ...) 保护
