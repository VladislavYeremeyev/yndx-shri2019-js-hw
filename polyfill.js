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
			this.state = PENDING;
			this.observers = [];
			executeResolver(fn, this);
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

	function handleThenable(promise, x) {
		try {
			var then = isThenable(x);
		} catch (err) {
			reject(promise, err);
			return true;
		}

		if (then) {
			var resolved = false;
			try {
				then(
					function(ful) {
						if (resolved) return;
						resolved = true;
						fulfill(promise, ful);
					},

					function(rej) {
						if (resolved) return;
						resolved = true;
						reject(promise, rej);
					}
				);
			} catch (err) {
				if (!resolved) {
					reject(promise, err);
				}
			}

			return true;
		}

		return false;
	}

	function handleObservers(promise, method) {
		promise.observers.forEach(function(observer) {
			var value = promise.value;
			try {
				if (typeof observer[method] === 'function') {
					value = observer[method](value);
				}

				if (observer.newPromise === value) {
					throw new TypeError(
						'Returned the same promise'
					);
				}

				if (handleThenable(observer.newPromise, value)) {
					return;
				}

				if (method === 'onRejected' && typeof observer[method] !== 'function') {
					reject(observer.newPromise, value);
				} else {
					fulfill(observer.newPromise, value);
				}
			} catch (err) {
				reject(observer.newPromise, err);
			}
		});
	}

	function fulfill(promise, x) {
		// typeof null === 'object', needs to check value
		if (x && typeof x === 'object' && x.constructor === Promise) {
			x.then(fulfill.bind(undefined, promise), reject.bind(undefined, promise));
			return;
		}

		if (promise.state === PENDING && !promise.value) {
			if (handleThenable(promise, x)) {
				return;
			}

			promise.value = x;
			promise.state = FULFILLED;
			handleObservers(promise, 'onFulfilled');
		}
	}

	function reject(promise, reason) {
		if (promise.state === PENDING && !promise.value) {
			promise.state = REJECTED;
			promise.value = reason;

			handleObservers(promise, 'onRejected');
		}
	}

	function executeResolver(resolver, promise) {
		function resolvePromise(value) {
			setTimeout(function() {
				fulfill(promise, value);
			}, 0);
		}

		function rejectPromise(reason) {
			setTimeout(function() {
				reject(promise, reason);
			}, 0);
		}

		try {
			resolver(resolvePromise, rejectPromise);
		} catch (err) {
			rejectPromise(err);
		}
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


	Promise.prototype.then = function(onFulfilled, onRejected) {
		var observer = {
			onFulfilled:
				typeof onFulfilled === 'function' && onFulfilled.bind(undefined),
			onRejected:
				typeof onRejected === 'function' && onRejected.bind(undefined),
			newPromise: new Promise(function() {})
		};
		
		if (this.state === FULFILLED && typeof onFulfilled === 'function') {
			setTimeout(
				function() {
					fulfill(observer.newPromise, onFulfilled(this.value));
				}.bind(this),
				0
			);
		}
		if (this.state === REJECTED && typeof onRejected === 'function') {
			setTimeout(
				function() {
					reject(observer.newPromise, onRejected(this.value));
				}.bind(this),
				0
			);
		} else {
			this.observers.push(observer);
		}

		return observer.newPromise;
	};

	Promise.prototype.catch = function(onRejected) {
		return this.then(undefined, onRejected);
	};

	environment.Promise = Promise;
})(typeof window === 'object' ? window : global);
