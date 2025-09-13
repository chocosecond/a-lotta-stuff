const fs = require("node:fs")
const jsyaml = require("js-yaml")
const { execSync } = require("child_process")
const random = require("random").default

const contents = fs.readFileSync("pnpm-lock.yaml")
const pkgjson = JSON.parse(fs.readFileSync("package.json"))
const parsed = jsyaml.load(contents);

const packages = [];
let flushcount = 0;

function flushpkgs() {
	flushcount++;
	console.log("=== " + flushcount + " ===");
	console.log(packages.join(" "));
	console.log();
	console.log();
	execSync("pnpm add " + packages.map((e) => '"' + e + '"').join(" "), {stdio: "inherit"});
	packages.length = 0;
}

const fullpackagelist = [...new Set(Object.keys(parsed["packages"]).map((e) => e.split("@").slice(0,-1).join("@")))]

for (const a of Object.keys(pkgjson["dependencies"])) {
	if (fullpackagelist.includes(a)) {
		fullpackagelist.splice(fullpackagelist.indexOf(a), 1)
	} else {
		process.exit(1)
	}
}

const randomized = random.shuffle(fullpackagelist)

for (const name of randomized) {
	if (!packages.includes(name)) {
		packages.push(name);
		if (packages.length == 200) {
			flushpkgs();
		}
	}
}

flushpkgs();
