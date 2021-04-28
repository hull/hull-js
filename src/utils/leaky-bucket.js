// Origin: https://github.com/linaGirl/leaky-bucket
// Version: 3.0.4
// License: MIT


class LeakyBucket {


    /**
    * Sets up the leaky bucket. The bucket is designed so that it can 
    * burst by the capacity it is given. after that items can be queued
    * until a timeout of n seonds is reached.
    *
    * example: throttle 10 actions per minute that have each a cost of 1, reject 
    * everything theat is overflowing. there will no more than 10 items queued 
    * at any time
    *   capacity: 10
    *   interval: 60
    *   timeout: 60
    *
    * example: throttle 100 actions per minute that have a cost of 1, reject 
    * items that have to wait more thatn 2 minutes. there will be no more thatn 
    * 200 items queued at any time. of those 200 items 100 will be bursted within
    * a minute, the rest will be executed evenly spread over a mintue.
    *   capacity: 100
    *   interval: 60
    *   timeout: 120
    *
    * @param {number} capacity the capacity the bucket has per interval
    * @param {number} timeout the total time items are allowed to wait for execution
    * @param {number} interval the interval for the capacity in seconds
    */
    constructor({
        capacity = 60,
        timeout,
        interval = 60000,
    } = {}) {
        // set the timeout to the interval if not set, so that the bucket overflows as soon
        // the capacity is reached
        if (isNaN(timeout)) timeout = interval;

        // queue containing all items to execute
        this.queue = [];

        // the value f all items currently enqueued
        this.totalCost = 0;

        // the capacity, which can be used at this moment
        // to execute items
        this.currentCapacity = capacity;

        // time when the last refill occured
        this.lastRefill = null;
        

        this.setCapacity(capacity);
        this.setTimeout(timeout);
        this.setInterval(interval);
    }




    /**
    * dthe throttle method is used to throttle things. it is async and will resolve either 
    * immediatelly, if there is space in the bucket, than can be bursted, or it will wait
    * until there is enough capacity left to execute the item with the given cost. if the 
    * bucket is overflowing, and the item cannot be executed within the timeout of the bucket,
    * the call will be rejected with an error.
    *
    * @param {number} cost=1 the cost of the item to be throttled. is the cost is unknown, 
    *                        the cost can be payed after execution using the pay method.
    *                        defaults to 1.
    * @param {boolean} append = true set to false if the item needs ot be added to the 
    *                                beginning of the queue
    * @param {boolean} isPause = false defines if the element is a pause elemtn, if yes, it 
    *                                  will not be cleaned off of the queue when checking
    *                                  for overflowing elements
    * @returns {promise} resolves when the item can be executed, rejects if the item cannot
    *                    be executed in time
    */
    throttle(cost = 1, append = true, isPause = false) {
        const maxCurrentCapacity = this.getCurrentMaxCapacity();

        // if items are added at the beginning, the excess items will be remove
        // later on
        if (append && this.totalCost + cost > maxCurrentCapacity) {
            throw new Error(`Cannot throttle item, bucket is overflowing: the maximum capacity is ${maxCurrentCapacity}, the current total capacity is ${this.totalCost}!`);
        }

        return new Promise((resolve, reject) => {
            const item = {
                resolve,
                reject,
                cost,
                isPause,
            };

            this.totalCost += cost;

            if (append) {
                this.queue.push(item); 
            } else {
                this.queue.unshift(item);
                this.cleanQueue();
            }


            this.startTimer();
        });
    }



    /**
    * either executes directly when enough capacity is present or delays the
    * execution until enough capacity is available.
    *
    * @private
    */
    startTimer() {
        if (!this.timer && this.queue.length > 0) {
            const item = this.getFirstItem();

            this.refill();

            if (this.currentCapacity >= item.cost) {
                item.resolve();

                // remove the item from the queue
                this.shiftQueue();

                // pay it's cost
                this.pay(item.cost);

                // go to the next item
                this.startTimer();
            } else {
                const requiredDelta = item.cost + (this.currentCapacity * -1);
                const timeToDelta = requiredDelta / this.refillRate * 1000;

                // wait until the next item can be handled
                this.timer = setTimeout(() => {
                    this.timer = 0;
                    this.startTimer();
                }, timeToDelta);
            }
        }
    }


    /**
    * removes the first item in the queue, resolves the promise that indicated
    * that the bucket is empty and no more items are waiting
    *
    * @private
    */
    shiftQueue() {
        this.queue.shift();

        if (this.queue.length === 0 && this.emptyPromiseResolver) {
            this.emptyPromiseResolver();
        }
    }



    /**
    * is resolved as soon as the bucket is empty. is basically an event
    * that is emitted
    */
    isEmpty() {
        if (!this.emptyPromiseResolver) {
            this.emptyPromise = new Promise((resolve) => {
                this.emptyPromiseResolver = () => {
                    this.emptyPromiseResolver = null;
                    this.emptyPromise = null;
                    resolve();
                };
            });
        }

        return this.emptyPromise;
    }




    /**
    * ends the bucket. The bucket may be recycled after this call
    */
    end() {
        this.stopTimer();
        this.clear();
    }



    /**
    * removes all items from the queue, does not stop the timer though
    *
    * @privae
    */
    clear() {
        this.queue = [];
    }



    /**
    * can be used to pay costs for items where the cost is clear after exection
    * this will devcrease the current capacity availabe on the bucket.
    *
    * @param {number} cost the ost to pay
    */
    pay(cost) {

        // reduce the current capacity, so that bursts
        // as calculated correctly
        this.currentCapacity -= cost;

        // keep track of the total cost for the bucket
        // so that we know when we're overflowing
        this.totalCost -= cost;

        // store the date the leky bucket was starting to leak
        // so that it can be refilled correctly
        if (this.lastRefill === null) {
            this.lastRefill = Date.now();
        }
    }



    /**
    * stops the running times
    * 
    * @private
    */
    stopTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }



    /**
    * refills the bucket with capacity which has become available since the
    * last refill. starts to refill after a call has started using capacity
    *
    * @private
    */
    refill() {

        // don't do refills, if we're already full
        if (this.currentCapacity < this.capacity) {

            // refill the currently avilable capacity
            const refillAmount = ((Date.now() - this.lastRefill) / 1000) * this.refillRate;
            this.currentCapacity += refillAmount;

            // make sure, that no more capacity is added than is the maximum
            if (this.currentCapacity >= this.capacity) {
                this.currentCapacity = this.capacity;
                this.lastRefill = null;
            } else {
                // date of last refill, ued for the next refill
                this.lastRefill = Date.now();
            }            
        }
    }



    /**
    * gets the currenlty avilable max capacity, respecintg
    * the capacity that is already used in the moment
    *
    * @private
    */
    getCurrentMaxCapacity() {
        this.refill();
        return this.maxCapacity - (this.capacity - this.currentCapacity);
    }



    /**
    * removes all items that cannot be executed in time due to items
    * that were added in front of them in the queue (mostly pause items)
    *
    * @private
    */
    cleanQueue() {
        const maxCapacity = this.getCurrentMaxCapacity();
        let currentCapacity = 0;
        
        // find the first item, that goes over the thoretical maximal
        // capacity that is available
        const index = this.queue.findIndex((item) => {
            currentCapacity += item.cost;
            return currentCapacity > maxCapacity;
        }); 


        // reject all items that cannot be enqueued
        if (index >= 0) {
            this.queue.splice(index).forEach((item) => {
                if (!item.isPause) {
                    item.reject(new Error(`Cannot throttle item because an item was added in front of it which caused the queue to overflow!`));
                    this.totalCost -= item.cost;
                }
            });
        }
    }



    /**
    * returns the first item from the queue
    *
    * @private
    */
    getFirstItem() {
        if (this.queue.length > 0) {
            return this.queue[0];
        } else {
            return null;
        }
    }



    /**
    * pasue the bucket for the given cost. means that an item is added in the 
    * front of the queue with the cost passed to this method
    *
    * @param {number} cost the cost to pasue by
    */
    pauseByCost(cost) {
        this.stopTimer();
        this.throttle(cost, false, true);
    }


    /**
    * pause the bucket for n seconds. means that an item with the cost for one
    * second is added at the beginning of the queue
    * 
    * @param {number} seconds the number of seconds to pause the bucket by
    */
    pause(seconds = 1) {
        this.drain();
        this.stopTimer();
        const cost = this.refillRate * seconds;
        this.pauseByCost(cost);
    }



    /**
    * drains the bucket, so that nothing can be exuted at the moment
    *
    * @private
    */
    drain() {
        this.currentCapacity = 0;
        this.lastRefill = Date.now();
    }



    /**
    * set the timeout value for the bucket. this is the amount of time no item 
    * may longer wait for.
    *
    * @param {number} timeout in seonds
    */
    setTimeout(timeout) {
        this.timeout = timeout;
        this.updateVariables();
        return this;
    }


    /**
    * set the interval within whch the capacity can be used
    *
    * @param {number} interval in seonds
    */
    setInterval(interval) {
        this.interval = interval;
        this.updateVariables();
        return this;
    }


    /**
    * set the capacity of the bucket. this si the capacity that can be used per interval
    *
    * @param {number} capacity
    */
    setCapacity(capacity) {
        this.capacity = capacity;
        this.updateVariables();
        return this;
    }



    /**
    * claculates the values of some frequently used variables on the bucket
    *
    * @private
    */
    updateVariables() {
        // take one as default for each variable since this method may be called
        // before every variable was set
        this.maxCapacity = ((this.timeout || 1) / (this.interval || 1)) * (this.capacity || 1);
        
        // the rate, at which the leaky bucket is filled per second
        this.refillRate = (this.capacity || 1) / (this.interval || 1);

    }
}

module.exports = LeakyBucket;