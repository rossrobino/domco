import "@/client/style.css";
import { version } from "domco/version";

console.log(version);

const p = document.createElement("p");
p.textContent = "client";
document.body.append(p);
