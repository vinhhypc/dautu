import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/* Máy dev có antivirus/proxy chặn TLS (Kaspersky…): Node không dùng kho chứng chỉ Windows, nên nạp CA xuất ra .certs/local-ca.pem nếu có. */
const ca = resolve(".certs/local-ca.pem");
const env = existsSync(ca) && !process.env.NODE_EXTRA_CA_CERTS ? { ...process.env, NODE_EXTRA_CA_CERTS: ca } : process.env;
const [command, ...args] = process.argv.slice(2);
const child = spawn(command, args, { stdio: "inherit", env, shell: process.platform === "win32" });
child.on("exit", (code) => process.exit(code ?? 1));
