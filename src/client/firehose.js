import superagent from "superagent";
import _ from "lodash";

API_PATH = "/api/v1/";
API_PATH_REGEXP = /^\/?api\/v1\//;
RESPONSE_HEADERS = [
  "Hull-Auth-Scope",
  "Hull-Track",
  "Hull-User-Id",
  "Hull-User-Sig",
  "X-Hits-Count",
  "Link"
];

const normalizePath = path =>
  API_PATH_REGEXP.test(path)
    ? path.replace(API_PATH_REGEXP, API_PATH)
    : `${API_PATH}${path.replace(/^\/,''/)}`;

const batchable = (delay, callback) => {
  let timeout = null;
  let args = [];
  return function(...params) {
    args.push(...params);
    clearTimeout(timeout);
    const delayed = () => {
      callback(...params);
      timeout = null;
      args = [];
    };
    timeout = setTimeout(delayed, delay);
  };
};

const reduceHeaders = headers =>
  _.pick(_.mapKeys(headers, (v, k) => k.toLowerCase()), RESPONSE_HEADERS);

const formatBatchParams = queue => ({
  sequential: true,
  ops: _.map(queue, ({ request }) => {
    const { method, path, params, headers } = request;
    return {
      method,
      url: path,
      ..._.omitBy(
        _.pick(request, ["params", "headers"]),
        (v, k) => v === undefined
      )
    };
  })
});

const formatResponse = (request, response = {}) => ({
  body: response.body,
  status: response.status,
  headers: reduceHeaders(response.headers),
  request
});

class Gateway {
  constructor({ batching, appId, identify }) {
    this.identify = identify;
    this.options = {
      min: 1,
      max: 1,
      delay: 2,
      ...batching
    };
    this.queue = batchable(options.delay, this.flush);
  }

  getIdentify = key => this.identify[key];
  resetIdentify = () => (this.identify = {});

  identifyBrowserAndSession = () => ({
    ...(cookies.get("_bid") ? {} : { "Hull-Bid": this.getIdentify("browser") }),
    ...(cookies.get("_sid") ? {} : { "Hull-Sid": this.getIdentify("session") })
  });

  after_middlewares: [];
  before_middlewares: [];

  handle = async request => {
    // const path = normalizePath(request.path)
    const response = await this.queue(request);
  };

  timeout: null;

  queue = async request => {
    const p = new Promise((resolve, reject) => {
      this._queue.push({ request, resolve, reject });
    });
    if (this._queue.length >= this.options.max) {
      clearTimeout(this.timeout);
      this.flush(this._queue);
    }
    this.timeout = setTimeout(() => {
      this.flush(this._queue);
    }, this.options.delay);
    return p;
  };

  flush = async queue => {
    if (queue.length <= this.options.min) {
      return await Promise.all(_.map(queue, this.handleOne));
    }
    await this.handleMany(_.take(queue, this.options.max));
    return this.flush(_.drop(requests, this.options.max));
  };

  handleOne = async ({ request, resolve, reject }) => {
    try {
      const response = await this.fetch(request);
      resolve(formatResponse(request, response));
    } catch (err) {
      reject(err);
    }
  };

  handleMany = async queue => {
    const { body } = await this.fetch({
      method: "post",
      path: "/api/v1/batch",
      params: formatBatchParams(requests)
    });
    const { results } = body;
    return _.map(queue, ({ request, resolve, reject }, index) => {
      const response = formatResponse(request, results[index]);
      resolve(response);
      return response;
    });
  };
}
