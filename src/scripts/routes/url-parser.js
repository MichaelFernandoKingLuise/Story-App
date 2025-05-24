const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const splitUrl = this._urlSplitter(url);
    return this._urlCombiner(splitUrl);
  },

  parseActiveUrlWithoutCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    return this._urlSplitter(url);
  },

  _urlSplitter(url) {
    const urlsSplits = url.split("/");
    return {
      resource: urlsSplits[1] || null,
      id: urlsSplits[2] || null,
      verb: urlsSplits[3] || null,
    };
  },

  _urlCombiner(splitUrl) {
    return (
      (splitUrl.resource ? `/${splitUrl.resource}` : "/") +
      (splitUrl.id ? "/:id" : "") +
      (splitUrl.verb ? `/${splitUrl.verb}` : "")
    );
  },
};

export default UrlParser;
