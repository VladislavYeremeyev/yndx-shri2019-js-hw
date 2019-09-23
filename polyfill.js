(function(environment) {
	// check if Promise is already exists
	if (
		environment.Promise &&
		Object.prototype.toString.call(environment.Promise.resolve({})) ===
			'[object Promise]'
	) {
		return;
	}

	var PENDING = 'pending';
	var FULFILLED = 'fulfilled';
	var REJECTED = 'rejected';

	function Promise(fn) {
		if (typeof fn === 'function') {
			// "instanceof" also checks for "inherited" constructors
			if (!this.constructor === Promise) {
				throw new TypeError(
					'Promise constructor could not be called as a function'
				);
			}
			this._state = PENDING;
			this._subscriptions = [];
			// TODO
			executeResolver(fn);
		} else {
			// template literals = ES6
			throw new TypeError('Promise resolver ' + fn + ' is not a function');
		}
	}

	function isThenable(value) {
		if (value && (typeof value === 'function' || typeof value === 'object')) {
			// "then" could be changed
			var thenRef = value.then;
			if (typeof thenRef === 'function') {
				return thenRef.bind(value);
			}
		}

		return false;
	}

	Promise.resolve = function(value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function(resolve) {
			resolve(value);
		});
	};

	Promise.reject = function(reason) {
		return new Promise(function(_, reject) {
			reject(reason);
		});
	};

	// TODO then, catch
	environment.Promise = Promise;
})(typeof window === 'object' ? window : global);
