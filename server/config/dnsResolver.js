const dns = require("dns");

// Fallback DNS resolver to ensure cloud services (Neon PostgreSQL, Cloudinary, Razorpay, Gmail)
// resolve seamlessly even when local Wi-Fi / ISP DNS servers block or refuse queries.
const origLookup = dns.lookup;
const fallbackResolver = new dns.Resolver();
fallbackResolver.setServers(["8.8.8.8", "1.1.1.1"]);

dns.lookup = (hostname, options, callback) => {
	let cb = callback;
	let opts = options;
	if (typeof opts === "function") {
		cb = opts;
		opts = {};
	}

	// Try standard OS lookup first
	origLookup(hostname, opts, (err, address, family) => {
		if (!err) {
			return cb(null, address, family);
		}

		// Fallback to public DNS if OS lookup failed (e.g. ENOTFOUND, refused, timeout)
		fallbackResolver.resolve4(hostname, (fallbackErr, addresses) => {
			if (!fallbackErr && addresses && addresses.length > 0) {
				if (opts && opts.all) {
					return cb(null, addresses.map((a) => ({ address: a, family: 4 })));
				}
				return cb(null, addresses[0], 4);
			}
			// If fallback also fails, return the original error
			cb(err);
		});
	});
};

module.exports = { fallbackResolver };
