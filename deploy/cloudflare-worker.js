/**
 * Cloudflare Worker — 全局计数器(点赞 / PV / UV)
 * 与前端 js/main.js 的 COUNTER_API 抽象完全兼容。
 *
 * 部署步骤(全程免费,免实名):
 * 1) 登录 https://dash.cloudflare.com → 左侧「Workers & Pages」→「KV」→ 创建命名空间,
 *    记下命名空间 ID(如 ns-xxxxxxxx)。命名建议:jianhua-counter
 * 2) 「Workers & Pages」→「Create」→ 选「Worker」→ 命名(如 jianhua-counter)→「Deploy」后「Edit code」。
 * 3) 把本文件内容整段粘贴进编辑器,保存。
 * 4) 在该 Worker 的「Settings → Variables」里:
 *      - Variables(非 secret)新增绑定:变量名 COUNTER_KV,类型选刚建的 KV 命名空间。
 *      (Cloudflare 的 KV 绑定在「KV」标签页的「Bindings」里添加,变量名必须与下面 env.COUNTER_KV 一致)
 * 5) 部署后,Worker 地址形如 https://jianhua-counter.<你的子域>.workers.dev
 *    把这一整串 URL 填进 js/main.js 的 COUNTER_API 即可(前端会自动请求 /counter?key=... )
 *
 * 免费额度(个人站绰绰有余):KV 每天 10 万次读 + 1000 次写免费;Worker 每天 10 万次请求免费。
 *
 * 注意:KV 是最终一致(eventually consistent),高并发瞬间自增可能有极小竞态,
 *      对个人博客完全可忽略;若要强一致可改用 D1 / Durable Objects,本文件结构无需改前端。
 */

export default {
  async fetch(request, env) {
    return handle(request, env);
  }
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function handle(request, env) {
  const url = new URL(request.url);

  // 仅暴露 /counter 接口
  if (url.pathname !== "/counter") {
    return new Response("Not Found", { status: 404, headers: CORS });
  }

  // 预检请求(浏览器跨域)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const key = url.searchParams.get("key");
  if (!key) return json({ error: "missing key" }, 400);

  const kv = env.COUNTER_KV;
  if (!kv) return json({ error: "KV not bound" }, 500);

  // 读取当前值
  if (request.method === "GET") {
    const raw = await kv.get(key);
    const n = raw === null ? 0 : parseInt(raw, 10) || 0;
    return json({ value: n }, 200);
  }

  // 增减(默认 +1)。支持负数(取消点赞 -1),结果不小于 0
  if (request.method === "POST") {
    let delta = parseInt(url.searchParams.get("delta") || "1", 10);
    if (isNaN(delta)) delta = 1;
    const raw = await kv.get(key);
    let n = raw === null ? 0 : parseInt(raw, 10) || 0;
    n = n + delta;
    if (n < 0) n = 0;
    await kv.put(key, String(n));
    return json({ value: n }, 200);
  }

  return new Response("Method Not Allowed", { status: 405, headers: CORS });
}
