import { version } from "domco/version";

console.log(version);

const p = document.createElement("p");
p.textContent = "client js script";
document.body.append(p);
