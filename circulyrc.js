"use strict";
// Circulyr v0.4 compiler - reference implementation (w/o gotos)
var circulyrc = {
	compile: function(i) {
		var o = [];

		// Parse [b], [c], [f], [m], [t], and [v]
		for (let section of i) {
			let temp = [];
			for (let line of section) {
				let m = line.match(circulyrc.regex.tag);
				if (m === null) {
					// Lines without tags are ignored
					temp.push(line);
				} else {
					switch (m[1]) {
						case "b": case "c": case "f": case "m": case "t": case "v":
							// Omitted if the tag type is flagged for omission
							if (circulyrc.flag(m[1])) temp.push(line);
							break;
						default:
							// Lines with repetitions or replacements are also ignored at this stage
							temp.push(line);
					}
				}
			}
			if (temp.length > 0) o.push(temp);
		}

		// Normalize output
		i = [];
		for (let section of o) {
			for (let line of section) i.push(line);
			i.push("");
		}
		i.pop();
		o = [];

		//TODO [g], [q]

		switch (circulyrc.flag("x")) {
			case 0: // Parse line repetitions and continue through case 1
				for (let line of i) {
					let m = line.match(circulyrc.regex.lineRep);
					if (m !== null) {
						// Remove repetition tag and repeat
						line = m[1];
						let temp = m[2];
						while (temp > 1) {
							o.push(line);
							temp--;
						}
					}
					o.push(line);
				}
				i = o;
				o = [];
			case 1: // Parse section repetitions
				for (let section of i.join("\n").split("\n\n")) {
					let lines = section.split("\n");
					let m = lines[lines.length - 1].match(circulyrc.regex.sectionRep);
					if (m !== null) {
						// Remove repetition tag and repeat
						lines.pop();
						let temp = m[1];
						while (temp > 1) {
							o.push(lines);
							temp--;
						}
					}
					o.push(lines);
				}
				// Normalize output
				i = [];
				for (let section of o) i.push(section.join("\n"));
				i = i.join("\n\n").split("\n");
				o = [];
		}

		for (let section of i) o.push(section);
		return o.join("\n");
	},

	// Read flags from <input>s
	flag: function(f) {
		let r = flag(f); // Out of scope - implement `window.flag()` e.g. to read from `<input>`s
		return r !== undefined ? r : 1;
	},

	regex: {
		tag: new RegExp("\\[([bcfgmpqrstv])\\:( ([^|\\]]+)( \\| ([^\\]]+))?)?\\]"),
		lineRep: new RegExp("(.+) \\[x(\\d+)\\]$"),
		sectionRep: new RegExp("^\\[x(\\d+)\\]$")
	}
};
