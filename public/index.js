// index.tsx
import React27 from "react";
import ReactDOM from "react-dom/client";

// node_modules/react-router/dist/development/chunk-UIGDSWPH.mjs
import * as React from "react";
import * as React2 from "react";
import * as React3 from "react";
import * as React4 from "react";
import * as React9 from "react";
import * as React8 from "react";
import * as React7 from "react";
import * as React6 from "react";
import * as React5 from "react";
import * as React10 from "react";
import * as React11 from "react";
var PopStateEventType = "popstate";
function createHashHistory(options = {}) {
  function createHashLocation(window2, globalHistory) {
    let {
      pathname = "/",
      search = "",
      hash = ""
    } = parsePath(window2.location.hash.substring(1));
    if (!pathname.startsWith("/") && !pathname.startsWith(".")) {
      pathname = "/" + pathname;
    }
    return createLocation(
      "",
      { pathname, search, hash },
      // state defaults to `null` because `window.history.state` does
      globalHistory.state && globalHistory.state.usr || null,
      globalHistory.state && globalHistory.state.key || "default"
    );
  }
  function createHashHref(window2, to) {
    let base = window2.document.querySelector("base");
    let href = "";
    if (base && base.getAttribute("href")) {
      let url = window2.location.href;
      let hashIndex = url.indexOf("#");
      href = hashIndex === -1 ? url : url.slice(0, hashIndex);
    }
    return href + "#" + (typeof to === "string" ? to : createPath(to));
  }
  function validateHashLocation(location, to) {
    warning(
      location.pathname.charAt(0) === "/",
      `relative pathnames are not supported in hash history.push(${JSON.stringify(
        to
      )})`
    );
  }
  return getUrlBasedHistory(
    createHashLocation,
    createHashHref,
    validateHashLocation,
    options
  );
}
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined")
      console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createKey() {
  return Math.random().toString(36).substring(2, 10);
}
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
function createLocation(current, to, state = null, key) {
  let location = {
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: "",
    ...typeof to === "string" ? parsePath(to) : to,
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  };
  return location;
}
function createPath({
  pathname = "/",
  search = "",
  hash = ""
}) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substring(hashIndex);
      path = path.substring(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substring(searchIndex);
      path = path.substring(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref2, validateLocation, options = {}) {
  let { window: window2 = document.defaultView, v5Compat = false } = options;
  let globalHistory = window2.history;
  let action = "POP";
  let listener = null;
  let index = getIndex();
  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, "");
  }
  function getIndex() {
    let state = globalHistory.state || { idx: null };
    return state.idx;
  }
  function handlePop() {
    action = "POP";
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({ action, location: history.location, delta });
    }
  }
  function push(to, state) {
    action = "PUSH";
    let location = createLocation(history.location, to, state);
    if (validateLocation)
      validateLocation(location, to);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window2.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 1 });
    }
  }
  function replace2(to, state) {
    action = "REPLACE";
    let location = createLocation(history.location, to, state);
    if (validateLocation)
      validateLocation(location, to);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 0 });
    }
  }
  function createURL(to) {
    return createBrowserURLImpl(to);
  }
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window2, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window2.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window2.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref2(window2, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace: replace2,
    go(n) {
      return globalHistory.go(n);
    }
  };
  return history;
}
function createBrowserURLImpl(to, isAbsolute = false) {
  let base = "http://localhost";
  if (typeof window !== "undefined") {
    base = window.location.origin !== "null" ? window.location.origin : window.location.href;
  }
  invariant(base, "No window.location.(origin|href) available to create URL");
  let href = typeof to === "string" ? to : createPath(to);
  href = href.replace(/ $/, "%20");
  if (!isAbsolute && href.startsWith("//")) {
    href = base + href;
  }
  return new URL(href, base);
}
var _map;
_map = /* @__PURE__ */ new WeakMap();
function matchRoutes(routes, locationArg, basename = "/") {
  return matchRoutesImpl(routes, locationArg, basename, false);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial) {
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    let decoded = decodePath(pathname);
    matches = matchRouteBranch(
      branches[i],
      decoded,
      allowPartial
    );
  }
  return matches;
}
function convertRouteMatchToUiMatch(match, loaderData) {
  let { route, pathname, params } = match;
  return {
    id: route.id,
    pathname,
    params,
    data: loaderData[route.id],
    loaderData: loaderData[route.id],
    handle: route.handle
  };
}
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "", _hasParentOptionalSegments = false) {
  let flattenRoute = (route, index, hasParentOptionalSegments = _hasParentOptionalSegments, relativePath) => {
    let meta = {
      relativePath: relativePath === void 0 ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      if (!meta.relativePath.startsWith(parentPath) && hasParentOptionalSegments) {
        return;
      }
      invariant(
        meta.relativePath.startsWith(parentPath),
        `Absolute route path "${meta.relativePath}" nested under path "${parentPath}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`
      );
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        `Index routes must not have child routes. Please remove all child routes from route path "${path}".`
      );
      flattenRoutes(
        route.children,
        branches,
        routesMeta,
        path,
        hasParentOptionalSegments
      );
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    if (route.path === "" || !route.path?.includes("?")) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, true, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0)
    return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(
    ...restExploded.map(
      (subpath) => subpath === "" ? required : [required, subpath].join("/")
    )
  );
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map(
    (exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded
  );
}
function rankRouteBranches(branches) {
  branches.sort(
    (a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(
      a.routesMeta.map((meta) => meta.childrenIndex),
      b.routesMeta.map((meta) => meta.childrenIndex)
    )
  );
}
var paramRe = /^:[\w-]+$/;
var dynamicSegmentValue = 3;
var indexRouteValue = 2;
var emptySegmentValue = 1;
var staticSegmentValue = 10;
var splatPenalty = -2;
var isSplat = (s) => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s) => !isSplat(s)).reduce(
    (score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue),
    initialScore
  );
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - b[b.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function matchRouteBranch(branch, pathname, allowPartial = false) {
  let { routesMeta } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath(
      { path: meta.relativePath, caseSensitive: meta.caseSensitive, end },
      remainingPathname
    );
    let route = meta.route;
    if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) {
      match = matchPath(
        {
          path: meta.relativePath,
          caseSensitive: meta.caseSensitive,
          end: false
        },
        remainingPathname
      );
    }
    if (!match) {
      return null;
    }
    Object.assign(matchedParams, match.params);
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(
        joinPaths([matchedPathname, match.pathnameBase])
      ),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = { path: pattern, caseSensitive: false, end: true };
  }
  let [matcher, compiledParams] = compilePath(
    pattern.path,
    pattern.caseSensitive,
    pattern.end
  );
  let match = pathname.match(matcher);
  if (!match)
    return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce(
    (memo2, { paramName, isOptional }, index) => {
      if (paramName === "*") {
        let splatValue = captureGroups[index] || "";
        pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
      }
      const value = captureGroups[index];
      if (isOptional && !value) {
        memo2[paramName] = void 0;
      } else {
        memo2[paramName] = (value || "").replace(/%2F/g, "/");
      }
      return memo2;
    },
    {}
  );
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive = false, end = true) {
  warning(
    path === "*" || !path.endsWith("*") || path.endsWith("/*"),
    `Route path "${path}" will be treated as if it were "${path.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${path.replace(/\*$/, "/*")}".`
  );
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(
    /\/:([\w-]+)(\?)?/g,
    (_, paramName, isOptional) => {
      params.push({ paramName, isOptional: isOptional != null });
      return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
    }
  ).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  if (path.endsWith("*")) {
    params.push({ paramName: "*" });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else {
  }
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, params];
}
function decodePath(value) {
  try {
    return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
  } catch (error) {
    warning(
      false,
      `The URL path "${value}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${error}).`
    );
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/")
    return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
function resolvePath(to, fromPathname = "/") {
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname = toPathname ? toPathname.startsWith("/") ? toPathname : resolvePathname(toPathname, fromPathname) : fromPathname;
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1)
        segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return `Cannot include a '${char}' character in a manually specified \`to.${field}\` field [${JSON.stringify(
    path
  )}].  Please separate it out to the \`to.${dest}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function getPathContributingMatches(matches) {
  return matches.filter(
    (match, index) => index === 0 || match.route.path && match.route.path.length > 0
  );
}
function getResolveToMatches(matches) {
  let pathMatches = getPathContributingMatches(matches);
  return pathMatches.map(
    (match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase
  );
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative = false) {
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = { ...toArg };
    invariant(
      !to.pathname || !to.pathname.includes("?"),
      getInvalidPathError("?", "pathname", "search", to)
    );
    invariant(
      !to.pathname || !to.pathname.includes("#"),
      getInvalidPathError("#", "pathname", "hash", to)
    );
    invariant(
      !to.search || !to.search.includes("#"),
      getInvalidPathError("#", "search", "hash", to)
    );
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
var joinPaths = (paths) => paths.join("/").replace(/\/\/+/g, "/");
var normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
var normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
var normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
var UninstrumentedSymbol = Symbol("Uninstrumented");
var objectProtoNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var validMutationMethodsArr = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
];
var validMutationMethods = new Set(
  validMutationMethodsArr
);
var validRequestMethodsArr = [
  "GET",
  ...validMutationMethodsArr
];
var validRequestMethods = new Set(validRequestMethodsArr);
var ResetLoaderDataSymbol = Symbol("ResetLoaderData");
var DataRouterContext = React.createContext(null);
DataRouterContext.displayName = "DataRouter";
var DataRouterStateContext = React.createContext(null);
DataRouterStateContext.displayName = "DataRouterState";
var RSCRouterContext = React.createContext(false);
var ViewTransitionContext = React.createContext({
  isTransitioning: false
});
ViewTransitionContext.displayName = "ViewTransition";
var FetchersContext = React.createContext(
  /* @__PURE__ */ new Map()
);
FetchersContext.displayName = "Fetchers";
var AwaitContext = React.createContext(null);
AwaitContext.displayName = "Await";
var NavigationContext = React.createContext(
  null
);
NavigationContext.displayName = "Navigation";
var LocationContext = React.createContext(
  null
);
LocationContext.displayName = "Location";
var RouteContext = React.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
RouteContext.displayName = "Route";
var RouteErrorContext = React.createContext(null);
RouteErrorContext.displayName = "RouteError";
var ENABLE_DEV_WARNINGS = true;
function useHref(to, { relative } = {}) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useHref() may be used only in the context of a <Router> component.`
  );
  let { basename, navigator: navigator2 } = React2.useContext(NavigationContext);
  let { hash, pathname, search } = useResolvedPath(to, { relative });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator2.createHref({ pathname: joinedPathname, search, hash });
}
function useInRouterContext() {
  return React2.useContext(LocationContext) != null;
}
function useLocation() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useLocation() may be used only in the context of a <Router> component.`
  );
  return React2.useContext(LocationContext).location;
}
var navigateEffectWarning = `You should call navigate() in a React.useEffect(), not when your component is first rendered.`;
function useIsomorphicLayoutEffect(cb) {
  let isStatic = React2.useContext(NavigationContext).static;
  if (!isStatic) {
    React2.useLayoutEffect(cb);
  }
}
function useNavigate() {
  let { isDataRoute } = React2.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useNavigate() may be used only in the context of a <Router> component.`
  );
  let dataRouterContext = React2.useContext(DataRouterContext);
  let { basename, navigator: navigator2 } = React2.useContext(NavigationContext);
  let { matches } = React2.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  let activeRef = React2.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React2.useCallback(
    (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current)
        return;
      if (typeof to === "number") {
        navigator2.go(to);
        return;
      }
      let path = resolveTo(
        to,
        JSON.parse(routePathnamesJson),
        locationPathname,
        options.relative === "path"
      );
      if (dataRouterContext == null && basename !== "/") {
        path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
      }
      (!!options.replace ? navigator2.replace : navigator2.push)(
        path,
        options.state,
        options
      );
    },
    [
      basename,
      navigator2,
      routePathnamesJson,
      locationPathname,
      dataRouterContext
    ]
  );
  return navigate;
}
var OutletContext = React2.createContext(null);
function useResolvedPath(to, { relative } = {}) {
  let { matches } = React2.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  return React2.useMemo(
    () => resolveTo(
      to,
      JSON.parse(routePathnamesJson),
      locationPathname,
      relative === "path"
    ),
    [to, routePathnamesJson, locationPathname, relative]
  );
}
function useRoutes(routes, locationArg) {
  return useRoutesImpl(routes, locationArg);
}
function useRoutesImpl(routes, locationArg, dataRouterState, unstable_onError, future) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`
  );
  let { navigator: navigator2 } = React2.useContext(NavigationContext);
  let { matches: parentMatches } = React2.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;
  if (ENABLE_DEV_WARNINGS) {
    let parentPath = parentRoute && parentRoute.path || "";
    warningOnce(
      parentPathname,
      !parentRoute || parentPath.endsWith("*") || parentPath.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${parentPathname}" (under <Route path="${parentPath}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${parentPath}"> to <Route path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`
    );
  }
  let locationFromContext = useLocation();
  let location;
  if (locationArg) {
    let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    invariant(
      parentPathnameBase === "/" || parsedLocationArg.pathname?.startsWith(parentPathnameBase),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${parentPathnameBase}" but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`
    );
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;
  if (parentPathnameBase !== "/") {
    let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
    let segments = pathname.replace(/^\//, "").split("/");
    remainingPathname = "/" + segments.slice(parentSegments.length).join("/");
  }
  let matches = matchRoutes(routes, { pathname: remainingPathname });
  if (ENABLE_DEV_WARNINGS) {
    warning(
      parentRoute || matches != null,
      `No routes matched location "${location.pathname}${location.search}${location.hash}" `
    );
    warning(
      matches == null || matches[matches.length - 1].route.element !== void 0 || matches[matches.length - 1].route.Component !== void 0 || matches[matches.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`
    );
  }
  let renderedMatches = _renderMatches(
    matches && matches.map(
      (match) => Object.assign({}, match, {
        params: Object.assign({}, parentParams, match.params),
        pathname: joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes.
          // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          navigator2.encodeLocation ? navigator2.encodeLocation(
            match.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : match.pathname
        ]),
        pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes
          // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          navigator2.encodeLocation ? navigator2.encodeLocation(
            match.pathnameBase.replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : match.pathnameBase
        ])
      })
    ),
    parentMatches,
    dataRouterState,
    unstable_onError,
    future
  );
  if (locationArg && renderedMatches) {
    return /* @__PURE__ */ React2.createElement(
      LocationContext.Provider,
      {
        value: {
          location: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
            ...location
          },
          navigationType: "POP"
          /* Pop */
        }
      },
      renderedMatches
    );
  }
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
  let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };
  let devInfo = null;
  if (ENABLE_DEV_WARNINGS) {
    console.error(
      "Error handled by React Router default ErrorBoundary:",
      error
    );
    devInfo = /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement("p", null, "\u{1F4BF} Hey developer \u{1F44B}"), /* @__PURE__ */ React2.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ React2.createElement("code", { style: codeStyles }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ React2.createElement("code", { style: codeStyles }, "errorElement"), " prop on your route."));
  }
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ React2.createElement("h3", { style: { fontStyle: "italic" } }, message), stack ? /* @__PURE__ */ React2.createElement("pre", { style: preStyles }, stack) : null, devInfo);
}
var defaultErrorElement = /* @__PURE__ */ React2.createElement(DefaultErrorComponent, null);
var RenderErrorBoundary = class extends React2.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }
    return {
      error: props.error !== void 0 ? props.error : state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.unstable_onError) {
      this.props.unstable_onError(error, errorInfo);
    } else {
      console.error(
        "React Router caught the following error during render",
        error
      );
    }
  }
  render() {
    return this.state.error !== void 0 ? /* @__PURE__ */ React2.createElement(RouteContext.Provider, { value: this.props.routeContext }, /* @__PURE__ */ React2.createElement(
      RouteErrorContext.Provider,
      {
        value: this.state.error,
        children: this.props.component
      }
    )) : this.props.children;
  }
};
function RenderedRoute({ routeContext, match, children }) {
  let dataRouterContext = React2.useContext(DataRouterContext);
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /* @__PURE__ */ React2.createElement(RouteContext.Provider, { value: routeContext }, children);
}
function _renderMatches(matches, parentMatches = [], dataRouterState = null, unstable_onError = null, future = null) {
  if (matches == null) {
    if (!dataRouterState) {
      return null;
    }
    if (dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else if (parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;
  let errors = dataRouterState?.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(
      (m) => m.route.id && errors?.[m.route.id] !== void 0
    );
    invariant(
      errorIndex >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(
        errors
      ).join(",")}`
    );
    renderedMatches = renderedMatches.slice(
      0,
      Math.min(renderedMatches.length, errorIndex + 1)
    );
  }
  let renderFallback = false;
  let fallbackIndex = -1;
  if (dataRouterState) {
    for (let i = 0; i < renderedMatches.length; i++) {
      let match = renderedMatches[i];
      if (match.route.HydrateFallback || match.route.hydrateFallbackElement) {
        fallbackIndex = i;
      }
      if (match.route.id) {
        let { loaderData, errors: errors2 } = dataRouterState;
        let needsToRunLoader = match.route.loader && !loaderData.hasOwnProperty(match.route.id) && (!errors2 || errors2[match.route.id] === void 0);
        if (match.route.lazy || needsToRunLoader) {
          renderFallback = true;
          if (fallbackIndex >= 0) {
            renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
          } else {
            renderedMatches = [renderedMatches[0]];
          }
          break;
        }
      }
    }
  }
  return renderedMatches.reduceRight(
    (outlet, match, index) => {
      let error;
      let shouldRenderHydrateFallback = false;
      let errorElement = null;
      let hydrateFallbackElement = null;
      if (dataRouterState) {
        error = errors && match.route.id ? errors[match.route.id] : void 0;
        errorElement = match.route.errorElement || defaultErrorElement;
        if (renderFallback) {
          if (fallbackIndex < 0 && index === 0) {
            warningOnce(
              "route-fallback",
              false,
              "No `HydrateFallback` element provided to render during initial hydration"
            );
            shouldRenderHydrateFallback = true;
            hydrateFallbackElement = null;
          } else if (fallbackIndex === index) {
            shouldRenderHydrateFallback = true;
            hydrateFallbackElement = match.route.hydrateFallbackElement || null;
          }
        }
      }
      let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
      let getChildren = () => {
        let children;
        if (error) {
          children = errorElement;
        } else if (shouldRenderHydrateFallback) {
          children = hydrateFallbackElement;
        } else if (match.route.Component) {
          children = /* @__PURE__ */ React2.createElement(match.route.Component, null);
        } else if (match.route.element) {
          children = match.route.element;
        } else {
          children = outlet;
        }
        return /* @__PURE__ */ React2.createElement(
          RenderedRoute,
          {
            match,
            routeContext: {
              outlet,
              matches: matches2,
              isDataRoute: dataRouterState != null
            },
            children
          }
        );
      };
      return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ React2.createElement(
        RenderErrorBoundary,
        {
          location: dataRouterState.location,
          revalidation: dataRouterState.revalidation,
          component: errorElement,
          error,
          children: getChildren(),
          routeContext: { outlet: null, matches: matches2, isDataRoute: true },
          unstable_onError
        }
      ) : getChildren();
    },
    null
  );
}
function getDataRouterConsoleError(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext(hookName) {
  let ctx = React2.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError(hookName));
  return ctx;
}
function useDataRouterState(hookName) {
  let state = React2.useContext(DataRouterStateContext);
  invariant(state, getDataRouterConsoleError(hookName));
  return state;
}
function useRouteContext(hookName) {
  let route = React2.useContext(RouteContext);
  invariant(route, getDataRouterConsoleError(hookName));
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  invariant(
    thisRoute.route.id,
    `${hookName} can only be used on routes that contain a unique "id"`
  );
  return thisRoute.route.id;
}
function useRouteId() {
  return useCurrentRouteId(
    "useRouteId"
    /* UseRouteId */
  );
}
function useNavigation() {
  let state = useDataRouterState(
    "useNavigation"
    /* UseNavigation */
  );
  return state.navigation;
}
function useMatches() {
  let { matches, loaderData } = useDataRouterState(
    "useMatches"
    /* UseMatches */
  );
  return React2.useMemo(
    () => matches.map((m) => convertRouteMatchToUiMatch(m, loaderData)),
    [matches, loaderData]
  );
}
function useRouteError() {
  let error = React2.useContext(RouteErrorContext);
  let state = useDataRouterState(
    "useRouteError"
    /* UseRouteError */
  );
  let routeId = useCurrentRouteId(
    "useRouteError"
    /* UseRouteError */
  );
  if (error !== void 0) {
    return error;
  }
  return state.errors?.[routeId];
}
function useNavigateStable() {
  let { router } = useDataRouterContext(
    "useNavigate"
    /* UseNavigateStable */
  );
  let id = useCurrentRouteId(
    "useNavigate"
    /* UseNavigateStable */
  );
  let activeRef = React2.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React2.useCallback(
    async (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current)
        return;
      if (typeof to === "number") {
        router.navigate(to);
      } else {
        await router.navigate(to, { fromRouteId: id, ...options });
      }
    },
    [router, id]
  );
  return navigate;
}
var alreadyWarned = {};
function warningOnce(key, cond, message) {
  if (!cond && !alreadyWarned[key]) {
    alreadyWarned[key] = true;
    warning(false, message);
  }
}
var MemoizedDataRoutes = React3.memo(DataRoutes);
function DataRoutes({
  routes,
  future,
  state,
  unstable_onError
}) {
  return useRoutesImpl(routes, void 0, state, unstable_onError, future);
}
function Route(props) {
  invariant(
    false,
    `A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.`
  );
}
function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = "POP",
  navigator: navigator2,
  static: staticProp = false
}) {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`
  );
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React3.useMemo(
    () => ({
      basename,
      navigator: navigator2,
      static: staticProp,
      future: {}
    }),
    [basename, navigator2, staticProp]
  );
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = React3.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  warning(
    locationContext != null,
    `<Router basename="${basename}"> is not able to match the URL "${pathname}${search}${hash}" because it does not start with the basename, so the <Router> won't render anything.`
  );
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ React3.createElement(NavigationContext.Provider, { value: navigationContext }, /* @__PURE__ */ React3.createElement(LocationContext.Provider, { children, value: locationContext }));
}
function Routes({
  children,
  location
}) {
  return useRoutes(createRoutesFromChildren(children), location);
}
function createRoutesFromChildren(children, parentPath = []) {
  let routes = [];
  React3.Children.forEach(children, (element, index) => {
    if (!React3.isValidElement(element)) {
      return;
    }
    let treePath = [...parentPath, index];
    if (element.type === React3.Fragment) {
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children, treePath)
      );
      return;
    }
    invariant(
      element.type === Route,
      `[${typeof element.type === "string" ? element.type : element.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`
    );
    invariant(
      !element.props.index || !element.props.children,
      "An index route cannot have child routes."
    );
    let route = {
      id: element.props.id || treePath.join("-"),
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      Component: element.props.Component,
      index: element.props.index,
      path: element.props.path,
      middleware: element.props.middleware,
      loader: element.props.loader,
      action: element.props.action,
      hydrateFallbackElement: element.props.hydrateFallbackElement,
      HydrateFallback: element.props.HydrateFallback,
      errorElement: element.props.errorElement,
      ErrorBoundary: element.props.ErrorBoundary,
      hasErrorBoundary: element.props.hasErrorBoundary === true || element.props.ErrorBoundary != null || element.props.errorElement != null,
      shouldRevalidate: element.props.shouldRevalidate,
      handle: element.props.handle,
      lazy: element.props.lazy
    };
    if (element.props.children) {
      route.children = createRoutesFromChildren(
        element.props.children,
        treePath
      );
    }
    routes.push(route);
  });
  return routes;
}
var defaultMethod = "get";
var defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
var _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
var supportedFormEncTypes = /* @__PURE__ */ new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    warning(
      false,
      `"${encType}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${defaultEncType}"`
    );
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error(
        `Cannot submit a <button> or <input type="submit"> without a <form>`
      );
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let { name, type, value } = target;
      if (type === "image") {
        let prefix = name ? `${name}.` : "";
        formData.append(`${prefix}x`, "0");
        formData.append(`${prefix}y`, "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error(
      `Cannot submit element that is not <form>, <button>, or <input type="submit|image">`
    );
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return { action, method: method.toLowerCase(), encType, formData, body };
}
var objectProtoNames2 = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function invariant2(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
var SingleFetchRedirectSymbol = Symbol("SingleFetchRedirect");
function singleFetchUrl(reqUrl, basename, extension) {
  let url = typeof reqUrl === "string" ? new URL(
    reqUrl,
    // This can be called during the SSR flow via PrefetchPageLinksImpl so
    // don't assume window is available
    typeof window === "undefined" ? "server://singlefetch/" : window.location.origin
  ) : reqUrl;
  if (url.pathname === "/") {
    url.pathname = `_root.${extension}`;
  } else if (basename && stripBasename(url.pathname, basename) === "/") {
    url.pathname = `${basename.replace(/\/$/, "")}/_root.${extension}`;
  } else {
    url.pathname = `${url.pathname.replace(/\/$/, "")}.${extension}`;
  }
  return url;
}
async function loadRouteModule(route, routeModulesCache) {
  if (route.id in routeModulesCache) {
    return routeModulesCache[route.id];
  }
  try {
    let routeModule = await import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      route.module
    );
    routeModulesCache[route.id] = routeModule;
    return routeModule;
  } catch (error) {
    console.error(
      `Error loading route module \`${route.module}\`, reloading page...`
    );
    console.error(error);
    if (window.__reactRouterContext && window.__reactRouterContext.isSpaMode && // @ts-expect-error
    import.meta.hot) {
      throw error;
    }
    window.location.reload();
    return new Promise(() => {
    });
  }
}
function isPageLinkDescriptor(object) {
  return object != null && typeof object.page === "string";
}
function isHtmlLinkDescriptor(object) {
  if (object == null) {
    return false;
  }
  if (object.href == null) {
    return object.rel === "preload" && typeof object.imageSrcSet === "string" && typeof object.imageSizes === "string";
  }
  return typeof object.rel === "string" && typeof object.href === "string";
}
async function getKeyedPrefetchLinks(matches, manifest, routeModules) {
  let links = await Promise.all(
    matches.map(async (match) => {
      let route = manifest.routes[match.route.id];
      if (route) {
        let mod = await loadRouteModule(route, routeModules);
        return mod.links ? mod.links() : [];
      }
      return [];
    })
  );
  return dedupeLinkDescriptors(
    links.flat(1).filter(isHtmlLinkDescriptor).filter((link) => link.rel === "stylesheet" || link.rel === "preload").map(
      (link) => link.rel === "stylesheet" ? { ...link, rel: "prefetch", as: "style" } : { ...link, rel: "prefetch" }
    )
  );
}
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
  let isNew = (match, index) => {
    if (!currentMatches[index])
      return true;
    return match.route.id !== currentMatches[index].route.id;
  };
  let matchPathChanged = (match, index) => {
    return (
      // param change, /users/123 -> /users/456
      currentMatches[index].pathname !== match.pathname || // splat param changed, which is not present in match.path
      // e.g. /files/images/avatar.jpg -> files/finances.xls
      currentMatches[index].route.path?.endsWith("*") && currentMatches[index].params["*"] !== match.params["*"]
    );
  };
  if (mode === "assets") {
    return nextMatches.filter(
      (match, index) => isNew(match, index) || matchPathChanged(match, index)
    );
  }
  if (mode === "data") {
    return nextMatches.filter((match, index) => {
      let manifestRoute = manifest.routes[match.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return false;
      }
      if (isNew(match, index) || matchPathChanged(match, index)) {
        return true;
      }
      if (match.route.shouldRevalidate) {
        let routeChoice = match.route.shouldRevalidate({
          currentUrl: new URL(
            location.pathname + location.search + location.hash,
            window.origin
          ),
          currentParams: currentMatches[0]?.params || {},
          nextUrl: new URL(page, window.origin),
          nextParams: match.params,
          defaultShouldRevalidate: true
        });
        if (typeof routeChoice === "boolean") {
          return routeChoice;
        }
      }
      return true;
    });
  }
  return [];
}
function getModuleLinkHrefs(matches, manifest, { includeHydrateFallback } = {}) {
  return dedupeHrefs(
    matches.map((match) => {
      let route = manifest.routes[match.route.id];
      if (!route)
        return [];
      let hrefs = [route.module];
      if (route.clientActionModule) {
        hrefs = hrefs.concat(route.clientActionModule);
      }
      if (route.clientLoaderModule) {
        hrefs = hrefs.concat(route.clientLoaderModule);
      }
      if (includeHydrateFallback && route.hydrateFallbackModule) {
        hrefs = hrefs.concat(route.hydrateFallbackModule);
      }
      if (route.imports) {
        hrefs = hrefs.concat(route.imports);
      }
      return hrefs;
    }).flat(1)
  );
}
function dedupeHrefs(hrefs) {
  return [...new Set(hrefs)];
}
function sortKeys(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}
function dedupeLinkDescriptors(descriptors, preloads) {
  let set = /* @__PURE__ */ new Set();
  let preloadsSet = new Set(preloads);
  return descriptors.reduce((deduped, descriptor) => {
    let alreadyModulePreload = preloads && !isPageLinkDescriptor(descriptor) && descriptor.as === "script" && descriptor.href && preloadsSet.has(descriptor.href);
    if (alreadyModulePreload) {
      return deduped;
    }
    let key = JSON.stringify(sortKeys(descriptor));
    if (!set.has(key)) {
      set.add(key);
      deduped.push({ key, link: descriptor });
    }
    return deduped;
  }, []);
}
function useDataRouterContext2() {
  let context = React8.useContext(DataRouterContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterContext.Provider> element"
  );
  return context;
}
function useDataRouterStateContext() {
  let context = React8.useContext(DataRouterStateContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  );
  return context;
}
var FrameworkContext = React8.createContext(void 0);
FrameworkContext.displayName = "FrameworkContext";
function useFrameworkContext() {
  let context = React8.useContext(FrameworkContext);
  invariant2(
    context,
    "You must render this element inside a <HydratedRouter> element"
  );
  return context;
}
function usePrefetchBehavior(prefetch, theirElementProps) {
  let frameworkContext = React8.useContext(FrameworkContext);
  let [maybePrefetch, setMaybePrefetch] = React8.useState(false);
  let [shouldPrefetch, setShouldPrefetch] = React8.useState(false);
  let { onFocus, onBlur, onMouseEnter, onMouseLeave, onTouchStart } = theirElementProps;
  let ref = React8.useRef(null);
  React8.useEffect(() => {
    if (prefetch === "render") {
      setShouldPrefetch(true);
    }
    if (prefetch === "viewport") {
      let callback = (entries) => {
        entries.forEach((entry) => {
          setShouldPrefetch(entry.isIntersecting);
        });
      };
      let observer = new IntersectionObserver(callback, { threshold: 0.5 });
      if (ref.current)
        observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [prefetch]);
  React8.useEffect(() => {
    if (maybePrefetch) {
      let id = setTimeout(() => {
        setShouldPrefetch(true);
      }, 100);
      return () => {
        clearTimeout(id);
      };
    }
  }, [maybePrefetch]);
  let setIntent = () => {
    setMaybePrefetch(true);
  };
  let cancelIntent = () => {
    setMaybePrefetch(false);
    setShouldPrefetch(false);
  };
  if (!frameworkContext) {
    return [false, ref, {}];
  }
  if (prefetch !== "intent") {
    return [shouldPrefetch, ref, {}];
  }
  return [
    shouldPrefetch,
    ref,
    {
      onFocus: composeEventHandlers(onFocus, setIntent),
      onBlur: composeEventHandlers(onBlur, cancelIntent),
      onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
      onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
      onTouchStart: composeEventHandlers(onTouchStart, setIntent)
    }
  ];
}
function composeEventHandlers(theirHandler, ourHandler) {
  return (event) => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}
function PrefetchPageLinks({ page, ...linkProps }) {
  let { router } = useDataRouterContext2();
  let matches = React8.useMemo(
    () => matchRoutes(router.routes, page, router.basename),
    [router.routes, page, router.basename]
  );
  if (!matches) {
    return null;
  }
  return /* @__PURE__ */ React8.createElement(PrefetchPageLinksImpl, { page, matches, ...linkProps });
}
function useKeyedPrefetchLinks(matches) {
  let { manifest, routeModules } = useFrameworkContext();
  let [keyedPrefetchLinks, setKeyedPrefetchLinks] = React8.useState([]);
  React8.useEffect(() => {
    let interrupted = false;
    void getKeyedPrefetchLinks(matches, manifest, routeModules).then(
      (links) => {
        if (!interrupted) {
          setKeyedPrefetchLinks(links);
        }
      }
    );
    return () => {
      interrupted = true;
    };
  }, [matches, manifest, routeModules]);
  return keyedPrefetchLinks;
}
function PrefetchPageLinksImpl({
  page,
  matches: nextMatches,
  ...linkProps
}) {
  let location = useLocation();
  let { manifest, routeModules } = useFrameworkContext();
  let { basename } = useDataRouterContext2();
  let { loaderData, matches } = useDataRouterStateContext();
  let newMatchesForData = React8.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "data"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let newMatchesForAssets = React8.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "assets"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let dataHrefs = React8.useMemo(() => {
    if (page === location.pathname + location.search + location.hash) {
      return [];
    }
    let routesParams = /* @__PURE__ */ new Set();
    let foundOptOutRoute = false;
    nextMatches.forEach((m) => {
      let manifestRoute = manifest.routes[m.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return;
      }
      if (!newMatchesForData.some((m2) => m2.route.id === m.route.id) && m.route.id in loaderData && routeModules[m.route.id]?.shouldRevalidate) {
        foundOptOutRoute = true;
      } else if (manifestRoute.hasClientLoader) {
        foundOptOutRoute = true;
      } else {
        routesParams.add(m.route.id);
      }
    });
    if (routesParams.size === 0) {
      return [];
    }
    let url = singleFetchUrl(page, basename, "data");
    if (foundOptOutRoute && routesParams.size > 0) {
      url.searchParams.set(
        "_routes",
        nextMatches.filter((m) => routesParams.has(m.route.id)).map((m) => m.route.id).join(",")
      );
    }
    return [url.pathname + url.search];
  }, [
    basename,
    loaderData,
    location,
    manifest,
    newMatchesForData,
    nextMatches,
    page,
    routeModules
  ]);
  let moduleHrefs = React8.useMemo(
    () => getModuleLinkHrefs(newMatchesForAssets, manifest),
    [newMatchesForAssets, manifest]
  );
  let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, dataHrefs.map((href) => /* @__PURE__ */ React8.createElement("link", { key: href, rel: "prefetch", as: "fetch", href, ...linkProps })), moduleHrefs.map((href) => /* @__PURE__ */ React8.createElement("link", { key: href, rel: "modulepreload", href, ...linkProps })), keyedPrefetchLinks.map(({ key, link }) => (
    // these don't spread `linkProps` because they are full link descriptors
    // already with their own props
    /* @__PURE__ */ React8.createElement("link", { key, nonce: linkProps.nonce, ...link })
  )));
}
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
try {
  if (isBrowser) {
    window.__reactRouterVersion = // @ts-expect-error
    "7.9.5";
  }
} catch (e) {
}
function HashRouter({ basename, children, window: window2 }) {
  let historyRef = React10.useRef();
  if (historyRef.current == null) {
    historyRef.current = createHashHistory({ window: window2, v5Compat: true });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = React10.useState({
    action: history.action,
    location: history.location
  });
  let setState = React10.useCallback(
    (newState) => {
      React10.startTransition(() => setStateImpl(newState));
    },
    [setStateImpl]
  );
  React10.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /* @__PURE__ */ React10.createElement(
    Router,
    {
      basename,
      children,
      location: state.location,
      navigationType: state.action,
      navigator: history
    }
  );
}
function HistoryRouter({
  basename,
  children,
  history
}) {
  let [state, setStateImpl] = React10.useState({
    action: history.action,
    location: history.location
  });
  let setState = React10.useCallback(
    (newState) => {
      React10.startTransition(() => setStateImpl(newState));
    },
    [setStateImpl]
  );
  React10.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /* @__PURE__ */ React10.createElement(
    Router,
    {
      basename,
      children,
      location: state.location,
      navigationType: state.action,
      navigator: history
    }
  );
}
HistoryRouter.displayName = "unstable_HistoryRouter";
var ABSOLUTE_URL_REGEX2 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var Link = React10.forwardRef(
  function LinkWithRef({
    onClick,
    discover = "render",
    prefetch = "none",
    relative,
    reloadDocument,
    replace: replace2,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition,
    ...rest
  }, forwardedRef) {
    let { basename } = React10.useContext(NavigationContext);
    let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX2.test(to);
    let absoluteHref;
    let isExternal = false;
    if (typeof to === "string" && isAbsolute) {
      absoluteHref = to;
      if (isBrowser) {
        try {
          let currentUrl = new URL(window.location.href);
          let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
          let path = stripBasename(targetUrl.pathname, basename);
          if (targetUrl.origin === currentUrl.origin && path != null) {
            to = path + targetUrl.search + targetUrl.hash;
          } else {
            isExternal = true;
          }
        } catch (e) {
          warning(
            false,
            `<Link to="${to}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`
          );
        }
      }
    }
    let href = useHref(to, { relative });
    let [shouldPrefetch, prefetchRef, prefetchHandlers] = usePrefetchBehavior(
      prefetch,
      rest
    );
    let internalOnClick = useLinkClickHandler(to, {
      replace: replace2,
      state,
      target,
      preventScrollReset,
      relative,
      viewTransition
    });
    function handleClick(event) {
      if (onClick)
        onClick(event);
      if (!event.defaultPrevented) {
        internalOnClick(event);
      }
    }
    let link = (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      /* @__PURE__ */ React10.createElement(
        "a",
        {
          ...rest,
          ...prefetchHandlers,
          href: absoluteHref || href,
          onClick: isExternal || reloadDocument ? onClick : handleClick,
          ref: mergeRefs(forwardedRef, prefetchRef),
          target,
          "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
        }
      )
    );
    return shouldPrefetch && !isAbsolute ? /* @__PURE__ */ React10.createElement(React10.Fragment, null, link, /* @__PURE__ */ React10.createElement(PrefetchPageLinks, { page: href })) : link;
  }
);
Link.displayName = "Link";
var NavLink = React10.forwardRef(
  function NavLinkWithRef({
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children,
    ...rest
  }, ref) {
    let path = useResolvedPath(to, { relative: rest.relative });
    let location = useLocation();
    let routerState = React10.useContext(DataRouterStateContext);
    let { navigator: navigator2, basename } = React10.useContext(NavigationContext);
    let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useViewTransitionState(path) && viewTransition === true;
    let toPathname = navigator2.encodeLocation ? navigator2.encodeLocation(path).pathname : path.pathname;
    let locationPathname = location.pathname;
    let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
    if (!caseSensitive) {
      locationPathname = locationPathname.toLowerCase();
      nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
      toPathname = toPathname.toLowerCase();
    }
    if (nextLocationPathname && basename) {
      nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
    }
    const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
    let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
    let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
    let renderProps = {
      isActive,
      isPending,
      isTransitioning
    };
    let ariaCurrent = isActive ? ariaCurrentProp : void 0;
    let className;
    if (typeof classNameProp === "function") {
      className = classNameProp(renderProps);
    } else {
      className = [
        classNameProp,
        isActive ? "active" : null,
        isPending ? "pending" : null,
        isTransitioning ? "transitioning" : null
      ].filter(Boolean).join(" ");
    }
    let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
    return /* @__PURE__ */ React10.createElement(
      Link,
      {
        ...rest,
        "aria-current": ariaCurrent,
        className,
        ref,
        style,
        to,
        viewTransition
      },
      typeof children === "function" ? children(renderProps) : children
    );
  }
);
NavLink.displayName = "NavLink";
var Form = React10.forwardRef(
  ({
    discover = "render",
    fetcherKey,
    navigate,
    reloadDocument,
    replace: replace2,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    viewTransition,
    ...props
  }, forwardedRef) => {
    let submit = useSubmit();
    let formAction = useFormAction(action, { relative });
    let formMethod = method.toLowerCase() === "get" ? "get" : "post";
    let isAbsolute = typeof action === "string" && ABSOLUTE_URL_REGEX2.test(action);
    let submitHandler = (event) => {
      onSubmit && onSubmit(event);
      if (event.defaultPrevented)
        return;
      event.preventDefault();
      let submitter = event.nativeEvent.submitter;
      let submitMethod = submitter?.getAttribute("formmethod") || method;
      submit(submitter || event.currentTarget, {
        fetcherKey,
        method: submitMethod,
        navigate,
        replace: replace2,
        state,
        relative,
        preventScrollReset,
        viewTransition
      });
    };
    return /* @__PURE__ */ React10.createElement(
      "form",
      {
        ref: forwardedRef,
        method: formMethod,
        action: formAction,
        onSubmit: reloadDocument ? onSubmit : submitHandler,
        ...props,
        "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
      }
    );
  }
);
Form.displayName = "Form";
function ScrollRestoration({
  getKey,
  storageKey,
  ...props
}) {
  let remixContext = React10.useContext(FrameworkContext);
  let { basename } = React10.useContext(NavigationContext);
  let location = useLocation();
  let matches = useMatches();
  useScrollRestoration({ getKey, storageKey });
  let ssrKey = React10.useMemo(
    () => {
      if (!remixContext || !getKey)
        return null;
      let userKey = getScrollRestorationKey(
        location,
        matches,
        basename,
        getKey
      );
      return userKey !== location.key ? userKey : null;
    },
    // Nah, we only need this the first time for the SSR render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  if (!remixContext || remixContext.isSpaMode) {
    return null;
  }
  let restoreScroll = ((storageKey2, restoreKey) => {
    if (!window.history.state || !window.history.state.key) {
      let key = Math.random().toString(32).slice(2);
      window.history.replaceState({ key }, "");
    }
    try {
      let positions = JSON.parse(sessionStorage.getItem(storageKey2) || "{}");
      let storedY = positions[restoreKey || window.history.state.key];
      if (typeof storedY === "number") {
        window.scrollTo(0, storedY);
      }
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem(storageKey2);
    }
  }).toString();
  return /* @__PURE__ */ React10.createElement(
    "script",
    {
      ...props,
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: {
        __html: `(${restoreScroll})(${JSON.stringify(
          storageKey || SCROLL_RESTORATION_STORAGE_KEY
        )}, ${JSON.stringify(ssrKey)})`
      }
    }
  );
}
ScrollRestoration.displayName = "ScrollRestoration";
function getDataRouterConsoleError2(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext3(hookName) {
  let ctx = React10.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError2(hookName));
  return ctx;
}
function useDataRouterState2(hookName) {
  let state = React10.useContext(DataRouterStateContext);
  invariant(state, getDataRouterConsoleError2(hookName));
  return state;
}
function useLinkClickHandler(to, {
  target,
  replace: replaceProp,
  state,
  preventScrollReset,
  relative,
  viewTransition
} = {}) {
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, { relative });
  return React10.useCallback(
    (event) => {
      if (shouldProcessLinkClick(event, target)) {
        event.preventDefault();
        let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
        navigate(to, {
          replace: replace2,
          state,
          preventScrollReset,
          relative,
          viewTransition
        });
      }
    },
    [
      location,
      navigate,
      path,
      replaceProp,
      state,
      target,
      to,
      preventScrollReset,
      relative,
      viewTransition
    ]
  );
}
var fetcherId = 0;
var getUniqueFetcherId = () => `__${String(++fetcherId)}__`;
function useSubmit() {
  let { router } = useDataRouterContext3(
    "useSubmit"
    /* UseSubmit */
  );
  let { basename } = React10.useContext(NavigationContext);
  let currentRouteId = useRouteId();
  return React10.useCallback(
    async (target, options = {}) => {
      let { action, method, encType, formData, body } = getFormSubmissionInfo(
        target,
        basename
      );
      if (options.navigate === false) {
        let key = options.fetcherKey || getUniqueFetcherId();
        await router.fetch(key, currentRouteId, options.action || action, {
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          flushSync: options.flushSync
        });
      } else {
        await router.navigate(options.action || action, {
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          replace: options.replace,
          state: options.state,
          fromRouteId: currentRouteId,
          flushSync: options.flushSync,
          viewTransition: options.viewTransition
        });
      }
    },
    [router, basename, currentRouteId]
  );
}
function useFormAction(action, { relative } = {}) {
  let { basename } = React10.useContext(NavigationContext);
  let routeContext = React10.useContext(RouteContext);
  invariant(routeContext, "useFormAction must be used inside a RouteContext");
  let [match] = routeContext.matches.slice(-1);
  let path = { ...useResolvedPath(action ? action : ".", { relative }) };
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    let indexValues = params.getAll("index");
    let hasNakedIndexParam = indexValues.some((v) => v === "");
    if (hasNakedIndexParam) {
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? `?${qs}` : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
var SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
var savedScrollPositions = {};
function getScrollRestorationKey(location, matches, basename, getKey) {
  let key = null;
  if (getKey) {
    if (basename !== "/") {
      key = getKey(
        {
          ...location,
          pathname: stripBasename(location.pathname, basename) || location.pathname
        },
        matches
      );
    } else {
      key = getKey(location, matches);
    }
  }
  if (key == null) {
    key = location.key;
  }
  return key;
}
function useScrollRestoration({
  getKey,
  storageKey
} = {}) {
  let { router } = useDataRouterContext3(
    "useScrollRestoration"
    /* UseScrollRestoration */
  );
  let { restoreScrollPosition, preventScrollReset } = useDataRouterState2(
    "useScrollRestoration"
    /* UseScrollRestoration */
  );
  let { basename } = React10.useContext(NavigationContext);
  let location = useLocation();
  let matches = useMatches();
  let navigation = useNavigation();
  React10.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);
  usePageHide(
    React10.useCallback(() => {
      if (navigation.state === "idle") {
        let key = getScrollRestorationKey(location, matches, basename, getKey);
        savedScrollPositions[key] = window.scrollY;
      }
      try {
        sessionStorage.setItem(
          storageKey || SCROLL_RESTORATION_STORAGE_KEY,
          JSON.stringify(savedScrollPositions)
        );
      } catch (error) {
        warning(
          false,
          `Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (${error}).`
        );
      }
      window.history.scrollRestoration = "auto";
    }, [navigation.state, getKey, basename, location, matches, storageKey])
  );
  if (typeof document !== "undefined") {
    React10.useLayoutEffect(() => {
      try {
        let sessionPositions = sessionStorage.getItem(
          storageKey || SCROLL_RESTORATION_STORAGE_KEY
        );
        if (sessionPositions) {
          savedScrollPositions = JSON.parse(sessionPositions);
        }
      } catch (e) {
      }
    }, [storageKey]);
    React10.useLayoutEffect(() => {
      let disableScrollRestoration = router?.enableScrollRestoration(
        savedScrollPositions,
        () => window.scrollY,
        getKey ? (location2, matches2) => getScrollRestorationKey(location2, matches2, basename, getKey) : void 0
      );
      return () => disableScrollRestoration && disableScrollRestoration();
    }, [router, basename, getKey]);
    React10.useLayoutEffect(() => {
      if (restoreScrollPosition === false) {
        return;
      }
      if (typeof restoreScrollPosition === "number") {
        window.scrollTo(0, restoreScrollPosition);
        return;
      }
      try {
        if (location.hash) {
          let el = document.getElementById(
            decodeURIComponent(location.hash.slice(1))
          );
          if (el) {
            el.scrollIntoView();
            return;
          }
        }
      } catch {
        warning(
          false,
          `"${location.hash.slice(
            1
          )}" is not a decodable element ID. The view will not scroll to it.`
        );
      }
      if (preventScrollReset === true) {
        return;
      }
      window.scrollTo(0, 0);
    }, [location, restoreScrollPosition, preventScrollReset]);
  }
}
function usePageHide(callback, options) {
  let { capture } = options || {};
  React10.useEffect(() => {
    let opts = capture != null ? { capture } : void 0;
    window.addEventListener("pagehide", callback, opts);
    return () => {
      window.removeEventListener("pagehide", callback, opts);
    };
  }, [callback, capture]);
}
function useViewTransitionState(to, { relative } = {}) {
  let vtContext = React10.useContext(ViewTransitionContext);
  invariant(
    vtContext != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?"
  );
  let { basename } = useDataRouterContext3(
    "useViewTransitionState"
    /* useViewTransitionState */
  );
  let path = useResolvedPath(to, { relative });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}

// App.tsx
import { useState as useState21, useEffect as useEffect18, useCallback as useCallback9 } from "react";

// supabaseService.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
var supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required. Check your .env file configuration.");
}
console.log("\u{1F50C} Initializing Supabase with URL:", supabaseUrl.substring(0, 50) + "...");
console.log("\u{1F527} Supabase Config:", {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  storageAvailable: typeof window !== "undefined" && !!window.localStorage
});
var supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic token refresh to prevent connection buildup
    autoRefreshToken: true,
    // Persist session in localStorage (but we'll manage it properly)
    persistSession: true,
    // Don't detect session in URL
    detectSessionInUrl: false,
    // Use localStorage for session storage
    storage: typeof window !== "undefined" ? window.localStorage : void 0
  },
  global: {
    headers: {
      "X-Client-Info": "jdlabs-interview-platform"
    }
  },
  db: {
    schema: "public"
  },
  // Realtime configuration to prevent connection leaks
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.includes("supabase.auth.token")) {
      console.log("\u{1F4E6} LocalStorage auth token changed:", {
        key: e.key,
        oldValue: e.oldValue ? "EXISTS" : "NULL",
        newValue: e.newValue ? "EXISTS" : "NULL"
      });
    }
  });
  window.addEventListener("error", (event) => {
    if (event.message?.toLowerCase().includes("supabase") || event.message?.toLowerCase().includes("auth")) {
      console.error("\u{1F6A8} [Global Error] Unhandled error related to Supabase:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.message?.toLowerCase().includes("supabase") || event.reason?.message?.toLowerCase().includes("auth")) {
      console.error("\u{1F6A8} [Global Promise Rejection] Unhandled rejection related to Supabase:", {
        reason: event.reason,
        promise: event.promise
      });
    }
  });
}
var logSupabaseCall = (operation, details) => {
  console.log(`\u{1F4E1} [Supabase API] ${operation}`, details);
};
var logSupabaseError = (operation, error) => {
  console.error(`\u274C [Supabase API Error] ${operation}`, {
    message: error?.message || "Unknown error",
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    status: error?.status
  });
};
var ensureUserProfile = async (user) => {
  const { error } = await supabase.from("users").upsert(
    {
      userid: user.id,
      // The column to match on
      email: user.email,
      name: user.user_metadata?.name || user.email
      // 'id' is the primary key and will be auto-generated on insert
    },
    { onConflict: "userid" }
    // If a user with this `userid` exists, do nothing.
  );
  if (error)
    console.error("Error ensuring user profile:", error);
};
var signUp = async (name, email, password) => {
  const { data: data2, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (!error && data2.user) {
    await createAuditLog(data2.user.id, "USER_REGISTER", data2.user.id, "auth.users", {
      changes: {
        created: {
          email: data2.user.email,
          name
        }
      },
      summary: `New user registered: ${name} (${data2.user.email})`,
      registration_method: "email_password"
    });
  }
  return { user: data2.user, session: data2.session, error };
};
var signIn = async (email, password) => {
  console.log("\u{1F511} [signIn] Starting sign-in process for:", email);
  console.log("\u{1F511} [signIn] Current localStorage keys:", Object.keys(localStorage).filter((k) => k.includes("supabase")));
  logSupabaseCall("auth.signInWithPassword", { email });
  const { data: data2, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("\u274C [signIn] Sign-in failed:", error.message);
    logSupabaseError("auth.signInWithPassword", error);
    return { user: null, session: null, error };
  }
  console.log("\u2705 [signIn] Sign-in successful:", {
    userId: data2.user?.id,
    email: data2.user?.email,
    hasSession: !!data2.session,
    sessionExpiresAt: data2.session?.expires_at
  });
  const storedSession = localStorage.getItem("sb-ctsqmhhjacigvhmhndhh-auth-token");
  console.log("\u{1F4E6} [signIn] Session stored in localStorage:", storedSession ? "YES" : "NO");
  if (data2.user) {
    ensureUserProfile(data2.user).catch((profileError) => console.error("\u26A0\uFE0F [signIn] Failed to ensure user profile:", profileError));
    createAuditLog(data2.user.id, "USER_LOGIN", data2.user.id, "auth.users", {
      summary: `User logged in successfully`,
      login_method: "email_password",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }).catch((logError) => console.error("\u26A0\uFE0F [signIn] Failed to create login audit log:", logError));
  }
  return { user: data2.user, session: data2.session, error };
};
var signInWithGoogle = async () => {
  const { data: data2, error } = await supabase.auth.signInWithOAuth({
    provider: "google"
  });
  return { data: data2, error };
};
var signOut = async (userId) => {
  console.log("\u{1F6AA} [signOut] Starting logout process for user:", userId);
  console.log("\u{1F6AA} [signOut] Current localStorage keys before logout:", Object.keys(localStorage).filter((k) => k.includes("supabase")));
  if (userId) {
    try {
      console.log("\u{1F4DD} [signOut] Creating audit log entry...");
      await createAuditLog(userId, "USER_LOGOUT", userId, "auth.users", {
        summary: `User logged out successfully`,
        logout_scope: "local",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log("\u2705 [signOut] Audit log created successfully");
    } catch (logError) {
      console.error("\u26A0\uFE0F [signOut] Failed to create logout audit log:", logError);
    }
  }
  console.log("\u{1F513} [signOut] Calling supabase.auth.signOut()...");
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    console.error("\u274C [signOut] Sign out error:", error);
    throw error;
  }
  console.log("\u2705 [signOut] Sign out successful");
  console.log("\u{1F6AA} [signOut] LocalStorage keys after logout:", Object.keys(localStorage).filter((k) => k.includes("supabase")));
  const storedSession = localStorage.getItem("sb-ctsqmhhjacigvhmhndhh-auth-token");
  console.log("\u{1F4E6} [signOut] Session still in localStorage:", storedSession ? "YES (PROBLEM!)" : "NO (GOOD)");
};
var getUserProfile = async (userId) => {
  console.log("\u{1F464} [getUserProfile] Fetching profile for user:", userId);
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("getUserProfile timeout after 20s")), 2e4);
    });
    logSupabaseCall("users.select", { userId });
    const fetchPromise = supabase.from("users").select("*").eq("userid", userId).single();
    const { data: data2, error } = await Promise.race([fetchPromise, timeoutPromise]);
    if (error) {
      console.error("\u274C [getUserProfile] Error fetching user profile:", error.message);
      console.error("\u274C [getUserProfile] Error details:", {
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      logSupabaseError("users.select", error);
      return null;
    }
    if (!data2) {
      console.warn("\u26A0\uFE0F [getUserProfile] No profile data returned for user:", userId);
      return null;
    }
    console.log("\u2705 [getUserProfile] Profile fetched successfully:", {
      userId: data2.id,
      name: data2.name,
      email: data2.email
    });
    return data2;
  } catch (error) {
    console.error("\u274C [getUserProfile] Exception fetching profile:", error.message);
    return null;
  }
};
var createInterview = async (authUserId, settings) => {
  try {
    const { data: userProfile, error: profileError } = await supabase.from("users").select("id").eq("userid", authUserId).single();
    if (profileError || !userProfile) {
      console.error(`Foreign key lookup failed: Could not find a user profile for auth user ID: ${authUserId}`, profileError);
      throw new Error(`Could not find a user profile for the current user.`);
    }
    const interviewData = {
      user_id: userProfile.id,
      // This now correctly references users.id
      candidate_name: settings.candidateName,
      position: settings.position,
      jobDescription: settings.jobDescription,
      mode: settings.mode,
      language: settings.language,
      model: settings.model,
      difficulty: settings.difficulty,
      status: "lobby"
    };
    const { data: newInterview, error: interviewError } = await supabase.from("interviews").insert(interviewData).select().single();
    if (interviewError) {
      console.error("Database error creating interview:", interviewError);
      throw interviewError;
    }
    await createAuditLog(authUserId, "INTERVIEW_CREATE", newInterview.id, "interviews", {
      changes: {
        created: {
          position: newInterview.position,
          mode: newInterview.mode,
          difficulty: newInterview.difficulty,
          language: newInterview.language,
          candidate_name: newInterview.candidate_name
        }
      },
      summary: `Created interview for position: ${newInterview.position}`,
      interview_mode: newInterview.mode,
      interview_difficulty: newInterview.difficulty
    });
    return newInterview;
  } catch (error) {
    console.error("Error in createInterview function:", error.message);
    return null;
  }
};
var finalizeInterview = async (params) => {
  const { interviewId, userId, transcript, malpracticeReport, reportData, mediaBlob, qna } = params;
  try {
    let mediaPath = null;
    if (mediaBlob) {
      const filePath = `${userId}/recordings/${interviewId}.webm`;
      const { error: uploadError } = await supabase.storage.from("interview-recordings").upload(filePath, mediaBlob, { upsert: true });
      if (uploadError)
        throw new Error(`Media upload failed: ${uploadError.message}`);
      mediaPath = filePath;
    }
    const { data: interviewData, error: fetchError } = await supabase.from("interviews").select("started_at").eq("id", interviewId).single();
    let durationMinutes = 0;
    if (!fetchError && interviewData?.started_at) {
      const startTime = new Date(interviewData.started_at).getTime();
      const endTime = (/* @__PURE__ */ new Date()).getTime();
      durationMinutes = Math.round((endTime - startTime) / 6e4);
    }
    const { error: interviewUpdateError } = await supabase.from("interviews").update({
      malpractice_report: malpracticeReport,
      video_url: mediaPath,
      status: "completed",
      ended_at: (/* @__PURE__ */ new Date()).toISOString(),
      duration_minutes: durationMinutes,
      overall_score: reportData?.overallRating || null,
      transcript: transcript || null
      // Store as-is, no JSON parsing needed
    }).eq("id", interviewId);
    if (interviewUpdateError)
      throw new Error(`Failed to update interview: ${interviewUpdateError.message}`);
    if (qna && qna.length > 0) {
      const questionRecordsToInsert = qna.map((pair, index) => ({
        interview_id: interviewId,
        question_text: pair.question,
        question_order: index + 1,
        // Add ordering
        asked_at: new Date((/* @__PURE__ */ new Date()).getTime() - (qna.length - index - 1) * 6e4).toISOString()
        // Estimate times
      }));
      const { data: insertedQuestions, error: questionsError } = await supabase.from("interview_questions").insert(questionRecordsToInsert).select("id, question_text, question_order");
      if (questionsError) {
        console.error("Error saving interview questions:", questionsError.message);
        throw new Error(`Failed to save interview questions: ${questionsError.message}`);
      }
      if (insertedQuestions && insertedQuestions.length > 0) {
        const answerRecordsToInsert = insertedQuestions.map((dbQuestion) => {
          const originalPair = qna.find((p) => p.question === dbQuestion.question_text);
          return {
            interview_id: interviewId,
            question_id: dbQuestion.id,
            answer_text: originalPair?.answer || "",
            duration_seconds: Math.round((originalPair?.answer?.length || 0) / 10),
            // Estimate duration from answer length
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        }).filter((a) => a.question_id);
        if (answerRecordsToInsert.length > 0) {
          const { error: answersError } = await supabase.from("interview_answers").insert(answerRecordsToInsert);
          if (answersError) {
            console.error("Error saving interview answers:", answersError.message);
            throw new Error(`Failed to save interview answers: ${answersError.message}`);
          }
        }
      }
    }
    if (reportData?.overallRating !== void 0 && reportData !== null) {
      const { data: userProfile } = await supabase.from("users").select("id").eq("userid", userId).single();
      if (userProfile) {
        const metricsText = reportData.metrics?.map((m) => `${m.name}: ${m.rating}/10 - ${m.reasoning}`).join("\n") || "";
        const feedbackContent = `Overall Reasoning: ${reportData.overallReasoning}

Metrics:
${metricsText}

Strengths:
- ${reportData.strengths?.join("\n- ")}

Areas for Improvement:
- ${reportData.areasForImprovement?.join("\n- ")}`;
        const recommendationMap = {
          "Recommended for Hire": "strongly_recommend",
          "Needs Improvement": "neutral",
          "Not a Fit": "not_recommend"
        };
        const dbRecommendation = recommendationMap[reportData.recommendation] || "neutral";
        console.log("\u{1F4CA} [finalizeInterview] Mapping recommendation:", {
          aiRecommendation: reportData.recommendation,
          dbRecommendation
        });
        const { error: reportError } = await supabase.from("performance_reports").insert({
          interview_id: interviewId,
          interviewer_id: userProfile.id,
          candidate_id: userProfile.id,
          // For now, same as interviewer
          overall_score: reportData.overallRating,
          recommendation: dbRecommendation,
          feedback: feedbackContent,
          technical_score: reportData.metrics?.find((m) => m.name.toLowerCase().includes("technical"))?.rating || null,
          communication_score: reportData.metrics?.find((m) => m.name.toLowerCase().includes("communication"))?.rating || null,
          problem_solving_score: reportData.metrics?.find((m) => m.name.toLowerCase().includes("problem"))?.rating || null,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (reportError) {
          console.error("Error creating performance report:", reportError.message);
        }
      }
    }
    await createAuditLog(userId, "INTERVIEW_FINALIZE", interviewId, "interviews", {
      changes: {
        updated: {
          status: "completed",
          ended_at: (/* @__PURE__ */ new Date()).toISOString(),
          duration_minutes: durationMinutes,
          overall_score: reportData?.overallRating || null,
          questions_answered: qna?.length || 0
        }
      },
      summary: `Finalized interview with ${qna?.length || 0} questions, score: ${reportData?.overallRating || "N/A"}`,
      questionCount: qna?.length || 0,
      hasVideo: !!mediaPath,
      hasMalpractice: !!malpracticeReport,
      durationMinutes,
      overallScore: reportData?.overallRating
    });
    return { success: true };
  } catch (error) {
    console.error("Error finalizing interview:", error);
    return { success: false, error: error.message };
  }
};
var getInterviewsForUser = async (authUserId) => {
  const { data: userProfile } = await supabase.from("users").select("id").eq("userid", authUserId).single();
  if (!userProfile) {
    console.error("User profile not found for auth ID:", authUserId);
    return [];
  }
  const { data: data2, error } = await supabase.from("interviews").select("*").eq("user_id", userProfile.id).order("created_at", { ascending: false });
  if (error)
    console.error("Error fetching user's interviews:", error);
  return data2 || [];
};
var getReportForInterview = async (interviewId) => {
  const { data: data2, error } = await supabase.from("performance_reports").select("*").eq("interview_id", interviewId).maybeSingle();
  if (error)
    console.error("Error fetching report for interview:", error);
  return data2;
};
var getCommentsForInterview = async (interviewId) => {
  const { data: data2, error } = await supabase.from("comments").select("*, users(name)").eq("interview_id", interviewId).order("created_at", { ascending: true });
  if (error)
    console.error("Error fetching comments:", error);
  return data2 || [];
};
var addComment = async (comment) => {
  console.log("\u{1F4AC} [addComment] Adding comment for user_id:", comment.user_id);
  const { data: userProfile } = await supabase.from("users").select("id").eq("userid", comment.user_id).single();
  if (!userProfile) {
    console.error("\u274C [addComment] User not found in users table for userid:", comment.user_id);
    return null;
  }
  console.log("\u2705 [addComment] Mapped userid to internal id:", {
    authUserId: comment.user_id,
    internalUserId: userProfile.id
  });
  const commentWithInternalId = {
    ...comment,
    user_id: userProfile.id
  };
  const { data: data2, error } = await supabase.from("comments").insert(commentWithInternalId).select().single();
  if (error) {
    console.error("\u274C [addComment] Error adding comment:", error);
    return null;
  }
  console.log("\u2705 [addComment] Comment added successfully");
  return data2;
};
var getRecordingDownloadUrl = async (mediaPath) => {
  const { data: data2, error } = await supabase.storage.from("interview-recordings").createSignedUrl(mediaPath, 3600);
  if (error) {
    console.error("Error creating signed URL for recording:", error);
    return null;
  }
  return data2.signedUrl;
};
var getJobs = async () => {
  const { data: data2, error } = await supabase.from("jobs").select("*");
  if (error)
    console.error("Error fetching jobs:", error);
  return data2 || [];
};
var getLanguages = async () => {
  const { data: data2, error } = await supabase.from("languages").select("*").eq("is_active", true);
  if (error)
    console.error("Error fetching languages:", error);
  return data2 || [];
};
var getQuestionsForInterview = async (interviewId) => {
  const { data: data2, error } = await supabase.from("interview_questions").select("*").eq("interview_id", interviewId);
  if (error)
    throw error;
  return data2 || [];
};
var getAnswersForInterview = async (questionIds) => {
  const { data: data2, error } = await supabase.from("interview_answers").select("*").in("question_id", questionIds);
  if (error)
    throw error;
  return data2 || [];
};
var createAuditLog = async (userId, action, entityId, tableName, details) => {
  try {
    let userName = "Unknown User";
    try {
      const { data: userProfile } = await supabase.from("users").select("name, email").eq("userid", userId).single();
      if (userProfile) {
        userName = userProfile.name || userProfile.email || "Unknown User";
      }
    } catch (userError) {
      console.warn("Could not fetch user name for audit log, using default");
    }
    const auditDetails = {
      ...details,
      action_type: action,
      table: tableName,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      user_info: {
        user_id: userId,
        user_name: userName
      }
    };
    const log = {
      user_id: userId,
      entity: userName,
      // Store user's name in entity column
      entity_id: entityId,
      action,
      table_name: tableName,
      details: auditDetails
      // Store detailed change information
    };
    const { error } = await supabase.from("audit_logs").insert(log);
    if (error) {
      console.error(`Failed to create audit log for action ${action}:`, error);
    }
  } catch (error) {
    console.error("Error in createAuditLog:", error.message);
  }
};

// components/Header.tsx
import { useState as useState6, useRef as useRef5, useEffect as useEffect6 } from "react";

// contexts/ToastContext.tsx
import React12, { createContext as createContext5, useState as useState5, useContext as useContext6, useCallback as useCallback4 } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var ToastContext = createContext5(void 0);
var CheckCircleIcon = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) });
var ExclamationCircleIcon = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) });
var InformationCircleIcon = () => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) });
var toastConfig = {
  success: { icon: /* @__PURE__ */ jsx(CheckCircleIcon, {}), barClass: "bg-green-500" },
  error: { icon: /* @__PURE__ */ jsx(ExclamationCircleIcon, {}), barClass: "bg-red-500" },
  info: { icon: /* @__PURE__ */ jsx(InformationCircleIcon, {}), barClass: "bg-blue-500" }
};
var ToastComponent = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState5(false);
  React12.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, 5e3);
    return () => clearTimeout(timer);
  }, [onClose]);
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };
  const config = toastConfig[toast.type];
  const typeClasses = {
    success: "text-green-400",
    error: "text-red-400",
    info: "text-blue-400"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "alert",
      className: `
                relative w-full max-w-sm overflow-hidden rounded-lg bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 border border-slate-700
                transition-all duration-300 ease-in-out transform
                ${isExiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
            `,
      children: [
        /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
          /* @__PURE__ */ jsx("div", { className: `flex-shrink-0 ${typeClasses[toast.type]}`, children: config.icon }),
          /* @__PURE__ */ jsx("div", { className: "ml-3 w-0 flex-1 pt-0.5", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-200", children: toast.message }) }),
          /* @__PURE__ */ jsx("div", { className: "ml-4 flex flex-shrink-0", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleClose,
              className: "inline-flex rounded-md bg-slate-800 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-800",
              children: [
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" }),
                /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" }) })
              ]
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: `absolute bottom-0 left-0 h-1 ${config.barClass} animate-progress` }),
        /* @__PURE__ */ jsx("style", { children: `
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 5s linear forwards;
                }
            ` })
      ]
    }
  );
};
var ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState5([]);
  const showToast = useCallback4((message, type = "info") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: { showToast }, children: [
    children,
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-live": "assertive",
        className: "pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50",
        children: /* @__PURE__ */ jsx("div", { className: "flex w-full flex-col items-center space-y-4 sm:items-end", children: toasts.map((toast) => /* @__PURE__ */ jsx(
          ToastComponent,
          {
            toast,
            onClose: () => removeToast(toast.id)
          },
          toast.id
        )) })
      }
    )
  ] });
};
var useToast = () => {
  const context = useContext6(ToastContext);
  if (context === void 0) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// components/Logo.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var Logo = () => /* @__PURE__ */ jsx2("div", { className: "flex items-center gap-2", "aria-label": "JD Labs Logo", children: /* @__PURE__ */ jsx2("img", { src: "https://storage.googleapis.com/jdlabs_images/images/JDLabsLogo.jpg", alt: "JD Labs Logo Icon", className: "h-12 w-22 " }) });
var Logo_default = Logo;

// components/Header.tsx
import { Fragment as Fragment7, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var navItems = [
  { name: "Community", path: "/community" },
  { name: "Learn", path: "/learn" },
  { name: "Features", path: "/features" },
  { name: "Pricing", path: "/pricing" },
  { name: "Contact", path: "/contact" }
];
var Header = ({ currentUser, onLogout }) => {
  const [isShareOpen, setIsShareOpen] = useState6(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState6(false);
  const shareRef = useRef5(null);
  const shareMenuRef = useRef5(null);
  const { showToast } = useToast();
  const navLinkClasses = ({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`;
  useEffect6(() => {
    if (isMobileMenuOpen)
      document.body.style.overflow = "hidden";
    else
      document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);
  useEffect6(() => {
    const handleClickOutside = (event) => {
      if (isShareOpen && shareRef.current && !shareRef.current.contains(event.target) && shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShareOpen]);
  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://jdlabs.dev").then(() => {
      showToast("Link copied to clipboard!", "success");
      setIsShareOpen(false);
    });
  };
  return /* @__PURE__ */ jsxs2("header", { className: "sticky top-0 z-30 w-full bg-slate-900/70 backdrop-blur-md border-b border-slate-700", children: [
    /* @__PURE__ */ jsx3("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center justify-between h-16", children: [
      /* @__PURE__ */ jsx3("div", { className: "flex items-center", children: /* @__PURE__ */ jsx3(NavLink, { to: "/", className: "flex-shrink-0", children: /* @__PURE__ */ jsx3(Logo_default, {}) }) }),
      /* @__PURE__ */ jsxs2("nav", { className: "hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2", children: [
        navItems.map((item) => /* @__PURE__ */ jsx3(NavLink, { to: item.path, className: navLinkClasses, children: item.name }, item.name)),
        currentUser && /* @__PURE__ */ jsx3(NavLink, { to: "/history", className: navLinkClasses, children: "History" })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-3", children: [
        currentUser ? /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs2("span", { className: "text-slate-300 hidden sm:inline", children: [
            "Welcome, ",
            currentUser.name
          ] }),
          /* @__PURE__ */ jsx3(
            "button",
            {
              onClick: onLogout,
              className: "bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors text-sm",
              children: "Logout"
            }
          )
        ] }) : /* @__PURE__ */ jsxs2("div", { className: "hidden md:flex items-center gap-3", children: [
          /* @__PURE__ */ jsx3(
            NavLink,
            {
              to: "/register",
              className: "bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-sm text-sm",
              children: "Register"
            }
          ),
          /* @__PURE__ */ jsx3(
            NavLink,
            {
              to: "/login",
              className: "bg-transparent hover:bg-slate-800 text-slate-200 font-medium py-2 px-4 rounded-md transition-colors border border-slate-600 text-sm",
              children: "Login"
            }
          )
        ] }),
        /* @__PURE__ */ jsx3("div", { className: "md:hidden", children: /* @__PURE__ */ jsx3("button", { onClick: () => setIsMobileMenuOpen(true), className: "text-slate-300 hover:text-white", children: /* @__PURE__ */ jsx3("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16m-7 6h7" }) }) }) })
      ] })
    ] }) }),
    isMobileMenuOpen && /* @__PURE__ */ jsxs2("div", { className: "fixed inset-0 z-50 bg-slate-900 md:hidden animate-fade-in", children: [
      /* @__PURE__ */ jsx3("div", { className: "absolute top-0 right-0 p-4", children: /* @__PURE__ */ jsx3("button", { onClick: () => setIsMobileMenuOpen(false), className: "text-slate-400 hover:text-white", "aria-label": "Close menu", children: /* @__PURE__ */ jsx3("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }) }),
      /* @__PURE__ */ jsxs2("div", { className: "flex flex-col items-center justify-center h-full", children: [
        /* @__PURE__ */ jsxs2("nav", { className: "flex flex-col items-center gap-6", children: [
          navItems.map((item) => /* @__PURE__ */ jsx3(NavLink, { to: item.path, onClick: () => setIsMobileMenuOpen(false), className: "text-2xl font-semibold text-slate-200 hover:text-blue-400 transition-colors", children: item.name }, item.name)),
          currentUser && /* @__PURE__ */ jsx3(NavLink, { to: "/history", onClick: () => setIsMobileMenuOpen(false), className: "text-2xl font-semibold text-slate-200 hover:text-blue-400 transition-colors", children: "History" })
        ] }),
        /* @__PURE__ */ jsx3("div", { className: "mt-12 pt-8 border-t border-slate-700 w-full max-w-xs flex flex-col items-center gap-4", children: currentUser ? /* @__PURE__ */ jsx3("button", { onClick: () => {
          onLogout();
          setIsMobileMenuOpen(false);
        }, className: "w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 px-6 rounded-md transition-colors text-lg", children: "Logout" }) : /* @__PURE__ */ jsxs2(Fragment7, { children: [
          /* @__PURE__ */ jsx3(NavLink, { to: "/register", onClick: () => setIsMobileMenuOpen(false), className: "w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-md transition-all", children: "Register" }),
          /* @__PURE__ */ jsx3(NavLink, { to: "/login", onClick: () => setIsMobileMenuOpen(false), className: "w-full text-center bg-transparent hover:bg-slate-800 text-slate-200 font-medium py-3 px-6 rounded-md transition-colors border border-slate-600", children: "Login" })
        ] }) })
      ] })
    ] })
  ] });
};
var Header_default = Header;

// components/Footer.tsx
import React14 from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var Footer = React14.forwardRef(({ onNavigate }, ref) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsx4("footer", { ref, className: "w-full bg-slate-900 border-t border-slate-700 py-6 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs3("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxs3("p", { className: "text-sm text-slate-400", children: [
      "\xA9 ",
      currentYear,
      " JD Labs. All rights reserved."
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsx4(
        "a",
        {
          href: "/terms",
          onClick: (e) => {
            e.preventDefault();
            onNavigate("terms");
          },
          className: "text-sm text-slate-400 hover:text-slate-200 transition-colors",
          children: "Terms & Conditions"
        }
      ),
      /* @__PURE__ */ jsx4(
        "a",
        {
          href: "/privacy",
          onClick: (e) => {
            e.preventDefault();
            onNavigate("privacy");
          },
          className: "text-sm text-slate-400 hover:text-slate-200 transition-colors",
          children: "Privacy Policy"
        }
      )
    ] })
  ] }) });
});
var Footer_default = Footer;

// components/SetupScreen.tsx
import { useState as useState9, useRef as useRef7, useEffect as useEffect9 } from "react";

// services/aiService.ts
import { GoogleGenAI, Type } from "@google/genai";
var createGeminiChatSession = (model, systemInstruction) => {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyDDjDns0923F5lbQMp1e9P_cmj1BInE89Q" });
  const chat = ai.chats.create({
    model,
    config: { systemInstruction }
  });
  return {
    sendMessage: async (message) => {
      const result = await chat.sendMessage({ message });
      return result.text;
    }
  };
};
var createChatSession = ({ model, systemInstruction }) => {
  return createGeminiChatSession(model, systemInstruction);
};
var extractTextFromUrl = async ({ model, url }) => {
  const prompt = `Please extract the full, clean text of the main job description from the following URL. Respond with only the job description text, with no introductory or concluding phrases like "Here is the job description". URL: ${url}`;
  const ai = new GoogleGenAI({ apiKey: "AIzaSyDDjDns0923F5lbQMp1e9P_cmj1BInE89Q" });
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text.trim();
};
var feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    overallRating: { type: Type.NUMBER, description: "An overall rating for the candidate from 1 (poor) to 10 (excellent), as a decimal." },
    overallReasoning: { type: Type.STRING, description: "A brief, one-sentence reasoning for the overall rating." },
    recommendation: { type: Type.STRING, description: "A final hiring recommendation. Must be one of: 'Recommended for Hire', 'Needs Improvement', 'Not a Fit'." },
    metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the skill being assessed (e.g., "Clarity & Communication", "Technical Depth", "Problem-Solving").' },
          rating: { type: Type.NUMBER, description: "A rating for this specific skill from 1 (poor) to 10 (excellent), as a decimal." },
          reasoning: { type: Type.STRING, description: "A brief, one-sentence reasoning for this skill rating, based on specific answers." }
        },
        required: ["name", "rating", "reasoning"]
      }
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 2-3 key strengths demonstrated by the candidate, citing evidence from their answers."
    },
    areasForImprovement: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 2-3 specific, actionable areas for improvement, citing evidence from their answers."
    }
  },
  required: ["overallRating", "overallReasoning", "recommendation", "metrics", "strengths", "areasForImprovement"]
};
var generateFeedback = async ({ model, questions, answers, settings, malpracticeReport }) => {
  const qaPairs = questions.map((q) => {
    const correspondingAnswer = answers.find((a) => a.question_id === q.id);
    return `Question: ${q.question_text}
Answer: ${correspondingAnswer ? correspondingAnswer.answer_text : "(No answer provided)"}`;
  }).join("\n\n---\n\n");
  let prompt = `
You are an expert hiring manager. Your task is to evaluate a candidate based on an interview transcript containing structured Question and Answer pairs.

Role: "${settings.position}"
Job Description: "${settings.jobDescription}"
Difficulty: "${settings.difficulty}"

Analyze the provided Q&A pairs and generate a feedback report. The report must be in JSON format and strictly follow the provided schema. For the 'recommendation' field, you must choose one of these exact values: 'Recommended for Hire', 'Needs Improvement', or 'Not a Fit'. Base your reasoning and scores on specific evidence from the candidate's answers.
`;
  if (malpracticeReport) {
    prompt += `
Additionally, consider the following malpractice report logged during the session. These events may indicate a lack of focus or preparation. Factor these into your evaluation, particularly for metrics like 'Professionalism' or 'Engagement', and mention them in the 'Areas for Improvement' if relevant.

--- MALPRACTICE REPORT ---
${malpracticeReport}
---
`;
  }
  prompt += `
Do not add any commentary or text outside of the JSON object.

Interview Transcript:
---
${qaPairs}
---
`;
  const ai = new GoogleGenAI({ apiKey: "AIzaSyDDjDns0923F5lbQMp1e9P_cmj1BInE89Q" });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: feedbackSchema
    }
  });
  const text = response.text?.trim();
  if (!text) {
    const blockReason = response.candidates?.[0]?.finishReason;
    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    let errorMessage = "The AI's response was empty.";
    if (blockReason) {
      errorMessage = `The AI's response was blocked. Reason: ${blockReason}.`;
      if (safetyRatings) {
        errorMessage += ` Safety ratings: ${JSON.stringify(safetyRatings)}`;
      }
    }
    console.error(errorMessage, { blockReason, safetyRatings });
    throw new Error(errorMessage);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI feedback JSON:", text, e);
    throw new Error("The AI returned an invalid JSON format. Please try again.");
  }
};

// types.ts
var InterviewMode = {
  VIDEO: "Video Interview",
  AUDIO: "Audio Interview",
  CHAT: "Chat Interview",
  LIVE_SHARE: "Live Share Interview"
};

// constants.tsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var SvgIcon = ({ d, className = "h-5 w-5" }) => /* @__PURE__ */ jsx5("svg", { xmlns: "http://www.w3.org/2000/svg", className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", d }) });
var AtSymbolIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" });
var LockClosedIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" });
var UserIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" });
var PencilIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125", className: "h-6 w-6" });
var BriefcaseIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v1.5H3.75V6zM3.75 9h16.5v8.25A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V9z", className: "h-6 w-6" });
var GlobeIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a9 9 0 00-8.2 4.5M12 21a9 9 0 01-8.2-4.5", className: "h-6 w-6" });
var SignalIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M6 20V10m4 10V4m4 16v-7", className: "h-6 w-6" });
var ClockIcon = ({ className = "h-8 w-8" }) => /* @__PURE__ */ jsx5(SvgIcon, { d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", className });
var ChartBarIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", className: "h-8 w-8" });
var AlertTriangleIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z", className: "h-8 w-8" });
var BookOpenIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25", className: "h-8 w-8" });
var AcademicCapIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-2.072-1.037a3.375 3.375 0 01-1.58-2.982V4.769a3.375 3.375 0 011.58-2.983l2.072-1.036m15.482 0l2.072-1.037a3.375 3.375 0 001.58-2.982V4.769a3.375 3.375 0 00-1.58-2.983l-2.072-1.036m0 12.133c-3.19.094-6.342.34-9.434.729m9.434-.729a50.57 50.57 0 01-2.658-.813m2.658.814l2.072 1.036a3.375 3.375 0 001.58 2.982v1.954a3.375 3.375 0 00-1.58 2.983l-2.072 1.036M3.493 12.133a50.57 50.57 0 002.658-.813m-2.658.814l-2.072 1.036a3.375 3.375 0 01-1.58 2.982v1.954a3.375 3.375 0 011.58 2.983l2.072 1.036", className: "h-8 w-8" });
var LightbulbIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.184m-1.5.184a6.01 6.01 0 01-1.5-.184m3.75 7.482a4.993 4.993 0 01-4.5 0m4.5 0a4.993 4.993 0 00-4.5 0m4.5 0l-.75-.75m-4.5 0l.75-.75m7.5-7.482a4.993 4.993 0 01-4.5 0m4.5 0a4.993 4.993 0 00-4.5 0m-4.5 0l.75.75m4.5 0l-.75.75", className: "h-6 w-6" });
var SimpleCheckIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M4.5 12.75l6 6 9-13.5", className: "h-6 w-6" });
var ThumbsUpIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H6.633a1.875 1.875 0 01-1.875-1.875V11.25a1.875 1.875 0 011.875-1.875z", className: "h-6 w-6" });
var ThumbsDownIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M17.367 13.5c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75A2.25 2.25 0 017.5 19.5c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.374c-1.026 0-1.945-.694-2.054-1.715A11.94 11.94 0 01.066 12c0-.435.023-.863.068-1.285.108-1.022 1.028-1.715 2.054-1.715h3.126c.618 0 .991-.724.725-1.282A7.471 7.471 0 017.5 4.5a2.25 2.25 0 012.25-1.75.75.75 0 01.75.75v3.25c0 .638.114 1.26.322 1.84a4.503 4.503 0 001.653 1.84c.723.384 1.35.956 1.653 1.715a4.498 4.498 0 00.322 1.672V12a1.875 1.875 0 01-1.875 1.875h-1.472z", className: "h-6 w-6" });
var MicOffIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6v7.5a4.5 4.5 0 008.25-2.167.75.75 0 00-1.5 0 3 3 0 01-6 0v-7.5a3 3 0 016 0v1.833A4.456 4.456 0 0115 9.75" });
var MicOnIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 5.25v-1.5m-6-6v-1.5m-6 7.5v-1.5m6 3.75v-1.5m0-11.25V4.5m0 14.25a3 3 0 003-3v-1.5m-6 0v1.5a3 3 0 003 3m-3-6a3 3 0 00-3 3v1.5m6 0v-1.5a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0v1.5m6-4.5v-1.5a3 3 0 00-3-3m0 0a3 3 0 00-3 3", className: "h-6 w-6" });
var SendIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" });
var SettingsIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M10.343 3.94c.09-.542.56-1.005 1.11-1.226l.28-.1c.386-.14.796-.14 1.182 0l.28.1c.55.22.955.617 1.045 1.158l.128.784a6.73 6.73 0 012.33 2.33l.783.128c.542.09.94.495 1.158 1.045l.1.28c.14.386.14.796 0 1.182l-.1.28c-.22.55-.617.955-1.158 1.045l-.784.128a6.73 6.73 0 01-2.33 2.33l-.128.783c-.09.542-.495.94-1.045 1.158l-.28.1c-.386.14-.796.14-1.182 0l-.28-.1c-.55-.22-1.005-.617-1.11-1.158l-.128-.784a6.73 6.73 0 01-2.33-2.33l-.783-.128c-.542-.09-1.018-.56-1.226-1.11l-.1-.28c-.14-.386-.14-.796 0-1.182l.1-.28c.22-.55.617.955 1.158-1.045l.784-.128a6.73 6.73 0 012.33-2.33l.128-.783zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" });
var UserCircleIcon = ({ className = "h-20 w-20" }) => /* @__PURE__ */ jsx5(SvgIcon, { d: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z", className });
var ShareIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5", className: "h-5 w-5" });
var DocumentDuplicateIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375v-3.375a1.125 1.125 0 00-1.125-1.125h-1.5a1.125 1.125 0 00-1.125 1.125v3.375" });
var VideoCameraIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z", className: "h-6 w-6" });
var ChatBubbleIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.097-.91.03-1.362A9.954 9.954 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", className: "h-6 w-6" });
var TargetIcon = () => /* @__PURE__ */ jsx5(SvgIcon, { d: "M8.25 12a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z M12 21a9 9 0 100-18 9 9 0 000 18z", className: "h-6 w-6" });
var GoogleIcon = () => /* @__PURE__ */ jsxs4("svg", { className: "h-6 w-6", viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx5("path", { d: "M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z", fill: "#4285F4" }),
  /* @__PURE__ */ jsx5("path", { d: "M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z", fill: "url(#paint0_linear_1_1)" }),
  /* @__PURE__ */ jsx5("defs", { children: /* @__PURE__ */ jsxs4("linearGradient", { id: "paint0_linear_1_1", x1: "24", y1: "2", x2: "24", y2: "46", gradientUnits: "userSpaceOnUse", children: [
    /* @__PURE__ */ jsx5("stop", { stopColor: "#4285F4" }),
    /* @__PURE__ */ jsx5("stop", { offset: "1", stopColor: "#34A853" })
  ] }) })
] });
var TRENDING_JOBS_DATA = [
  {
    id: "sample-1",
    // FIX: Replaced 'user_id' with 'created_by' and added 'is_active' to match the Job type definition.
    created_by: "system",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_active: true,
    title: "Software Engineer",
    description: "Seeking a proactive software engineer with experience in React and Node.js to build and maintain scalable web applications."
  },
  {
    id: "sample-2",
    // FIX: Replaced 'user_id' with 'created_by' and added 'is_active' to match the Job type definition.
    created_by: "system",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_active: true,
    title: "Product Manager",
    description: "Looking for a strategic product manager to lead cross-functional teams and drive product vision from conception to launch."
  },
  {
    id: "sample-3",
    // FIX: Replaced 'user_id' with 'created_by' and added 'is_active' to match the Job type definition.
    created_by: "system",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_active: true,
    title: "Data Scientist",
    description: "Seeking an analytical data scientist proficient in Python, machine learning, and statistical modeling to derive insights from complex datasets."
  },
  {
    id: "sample-4",
    // FIX: Replaced 'user_id' with 'created_by' and added 'is_active' to match the Job type definition.
    created_by: "system",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_active: true,
    title: "UX Designer",
    description: "Looking for a creative UX designer to craft intuitive user experiences and collaborate with product and engineering teams."
  }
];
var primaryCtaClass = "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 transition-all duration-300 ease-in-out";
var PLANS = [
  {
    name: "Free",
    price: 0,
    description: "For individuals & small teams getting started.",
    features: [
      "3 AI Interviews per month",
      "Basic Feedback Analysis",
      "Chat & Audio Interviews",
      "Community Access"
    ],
    cta: "Get Started",
    ctaClass: "bg-slate-700 hover:bg-slate-600 text-white"
  },
  {
    name: "Plus",
    price: 499,
    description: "For professionals and frequent users.",
    features: [
      "25 AI Interviews per month",
      "Advanced AI Analytics",
      "Video & Audio Recording",
      "Priority Email Support"
    ],
    cta: "Choose Plan",
    ctaClass: primaryCtaClass,
    highlight: {
      text: "Budget Friendly",
      color: "green"
    }
  },
  {
    name: "Pro",
    price: 999,
    description: "For businesses and power users.",
    features: [
      "50 AI Interviews per month",
      "Everything in Plus",
      "Live Share / Coding Interviews",
      "Team Collaboration Features"
    ],
    cta: "Choose Plan",
    ctaClass: primaryCtaClass,
    highlight: {
      text: "Most Popular",
      color: "blue"
    }
  }
];

// components/JobCarousel.tsx
import { useState as useState7, useEffect as useEffect7, useRef as useRef6, useCallback as useCallback5 } from "react";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var JobCard = ({ job, onSelect }) => /* @__PURE__ */ jsxs5("div", { className: "bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg border border-slate-700 flex flex-col h-full hover:border-blue-500 transition-all duration-300 group transform hover:-translate-y-1", children: [
  /* @__PURE__ */ jsx6("h3", { className: "font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors", children: job.title }),
  /* @__PURE__ */ jsx6("p", { className: "text-sm text-slate-400 mt-2 flex-grow", children: job.description }),
  /* @__PURE__ */ jsx6("div", { className: "mt-4 flex items-center justify-end", children: /* @__PURE__ */ jsx6("button", { onClick: onSelect, className: "bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors shadow-sm", children: "Select" }) })
] });
var JobCarousel = ({ jobs, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState7(0);
  const [itemsToShow, setItemsToShow] = useState7(3);
  const timeoutRef = useRef6(null);
  const containerRef = useRef6(null);
  const updateItemsToShow = useCallback5(() => {
    if (window.innerWidth >= 1024)
      setItemsToShow(3);
    else if (window.innerWidth >= 768)
      setItemsToShow(2);
    else
      setItemsToShow(1);
  }, []);
  useEffect7(() => {
    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, [updateItemsToShow]);
  const maxIndex = jobs.length > itemsToShow ? jobs.length - itemsToShow : 0;
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  const goNext = useCallback5(() => {
    setCurrentIndex((prevIndex) => prevIndex >= maxIndex ? 0 : prevIndex + 1);
  }, [maxIndex]);
  useEffect7(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(goNext, 5e3);
    return () => resetTimeout();
  }, [currentIndex, maxIndex, goNext]);
  const goPrev = () => {
    setCurrentIndex((prevIndex) => prevIndex <= 0 ? maxIndex : prevIndex - 1);
  };
  if (jobs.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      className: "relative w-full group",
      onMouseEnter: resetTimeout,
      onMouseLeave: () => {
        timeoutRef.current = setTimeout(goNext, 5e3);
      },
      children: [
        /* @__PURE__ */ jsx6("div", { className: "overflow-hidden", ref: containerRef, children: /* @__PURE__ */ jsx6(
          "div",
          {
            className: "flex transition-transform duration-500 ease-in-out",
            style: { transform: `translateX(-${currentIndex * 100 / itemsToShow}%)` },
            children: jobs.map((job) => /* @__PURE__ */ jsx6("div", { className: "p-2", style: { flex: `0 0 ${100 / itemsToShow}%` }, children: /* @__PURE__ */ jsx6(JobCard, { job, onSelect: () => onSelect(job) }) }, job.id))
          }
        ) }),
        /* @__PURE__ */ jsx6(
          "button",
          {
            onClick: goPrev,
            className: "absolute top-1/2 -left-4 -translate-y-1/2 bg-slate-700/50 hover:bg-slate-600 rounded-full p-2 z-10 transition-opacity opacity-0 group-hover:opacity-100",
            "aria-label": "Previous Job",
            children: /* @__PURE__ */ jsx6("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx6("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsx6(
          "button",
          {
            onClick: goNext,
            className: "absolute top-1/2 -right-4 -translate-y-1/2 bg-slate-700/50 hover:bg-slate-600 rounded-full p-2 z-10 transition-opacity opacity-0 group-hover:opacity-100",
            "aria-label": "Next Job",
            children: /* @__PURE__ */ jsx6("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx6("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
          }
        )
      ]
    }
  );
};
var JobCarousel_default = JobCarousel;

// components/FeatureCard.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var FeatureCard = ({ icon, title, children, media, reverseLayout = false }) => {
  const layoutClasses = `flex flex-col ${reverseLayout ? "md:flex-row-reverse" : "md:flex-row"} gap-8 lg:gap-12 items-center`;
  return /* @__PURE__ */ jsxs6("div", { className: layoutClasses, children: [
    /* @__PURE__ */ jsx7("div", { className: "w-full md:w-1/2 flex-shrink-0", children: media }),
    /* @__PURE__ */ jsxs6("div", { className: "w-full md:w-1/2", children: [
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-4 mb-4", children: [
        /* @__PURE__ */ jsx7("div", { className: "flex-shrink-0 h-12 w-12 bg-slate-800 text-blue-400 rounded-lg flex items-center justify-center border border-slate-700", children: icon }),
        /* @__PURE__ */ jsx7("h3", { className: "text-2xl lg:text-3xl font-bold text-slate-100", children: title })
      ] }),
      /* @__PURE__ */ jsx7("div", { className: "text-slate-400 space-y-3 text-base lg:text-lg leading-relaxed", children })
    ] })
  ] });
};
var FeatureCard_default = FeatureCard;

// components/MediaContainer.tsx
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var MediaContainer = ({ children }) => {
  return /* @__PURE__ */ jsxs7("div", { className: "relative group aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20", children: [
    children,
    /* @__PURE__ */ jsx8("div", { className: "absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300 pointer-events-none" })
  ] });
};
var MediaContainer_default = MediaContainer;

// components/ImageSlider.tsx
import { useState as useState8, useEffect as useEffect8 } from "react";
import { jsx as jsx9 } from "react/jsx-runtime";
var ImageSlider = ({ images, interval = 5e3 }) => {
  const [currentIndex, setCurrentIndex] = useState8(0);
  useEffect8(() => {
    if (images.length <= 1)
      return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);
  if (!images || images.length === 0) {
    return /* @__PURE__ */ jsx9("div", { className: "w-full h-full flex items-center justify-center text-slate-500", children: "No Image" });
  }
  return /* @__PURE__ */ jsx9("div", { className: "relative w-full h-full overflow-hidden", children: images.map((image, index) => /* @__PURE__ */ jsx9(
    "div",
    {
      className: `absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`,
      children: /* @__PURE__ */ jsx9(
        "img",
        {
          src: image,
          alt: `Feature image ${index + 1}`,
          className: "w-full h-full object-cover ken-burns"
        }
      )
    },
    index
  )) });
};
var ImageSlider_default = ImageSlider;

// components/AudioVisualizer.tsx
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
var AudioVisualizer = ({ isSpeaking, status }) => {
  const ecgBeat = "l 15 0 l 5 -10 l 10 25 l 5 -30 l 5 15 l 20 0";
  const speakingWave = `M -200 100 ${ecgBeat.repeat(10)}`;
  const idleWave = "M -200 100 C -150 100, -150 100, -100 100 C -50 100, -50 100, 0 100 C 50 100, 50 100, 100 100 C 150 100, 150 100, 200 100 C 250 100, 250 100, 300 100";
  const idleWavePulse1 = "M -200 100 C -150 103, -150 103, -100 100 C -50 97, -50 97, 0 100 C 50 103, 50 103, 100 100 C 150 97, 150 97, 200 100 C 250 103, 250 103, 300 100";
  const idleWavePulse2 = "M -200 100 C -150 97, -150 97, -100 100 C -50 103, -50 103, 0 100 C 50 97, 50 97, 100 100 C 150 103, 150 103, 200 100 C 250 97, 250 97, 300 100";
  return /* @__PURE__ */ jsxs8("div", { className: "relative w-full h-full bg-slate-950 rounded-lg overflow-hidden aspect-video transition-colors duration-300 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsxs8("svg", { width: "100%", height: "100%", viewBox: "0 0 200 200", children: [
      /* @__PURE__ */ jsxs8("defs", { children: [
        /* @__PURE__ */ jsx10("clipPath", { id: "circle-clip", children: /* @__PURE__ */ jsx10("circle", { cx: "100", cy: "100", r: "80" }) }),
        /* @__PURE__ */ jsxs8("filter", { id: "glow-effect", x: "-50%", y: "-50%", width: "200%", height: "200%", children: [
          /* @__PURE__ */ jsx10("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "2", result: "blur" }),
          /* @__PURE__ */ jsxs8("feMerge", { children: [
            /* @__PURE__ */ jsx10("feMergeNode", { in: "blur" }),
            /* @__PURE__ */ jsx10("feMergeNode", { in: "SourceGraphic" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx10("circle", { cx: "100", cy: "100", r: "80", fill: "transparent", stroke: "rgba(79, 128, 255, 0.2)", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx10("circle", { cx: "100", cy: "100", r: "60", fill: "transparent", stroke: "rgba(79, 128, 255, 0.1)", strokeWidth: "1" }),
      /* @__PURE__ */ jsx10("circle", { cx: "100", cy: "100", r: "40", fill: "transparent", stroke: "rgba(79, 128, 255, 0.1)", strokeWidth: "1" }),
      /* @__PURE__ */ jsx10("circle", { cx: "100", cy: "100", r: "20", fill: "transparent", stroke: "rgba(79, 128, 255, 0.1)", strokeWidth: "1" }),
      /* @__PURE__ */ jsx10("g", { clipPath: "url(#circle-clip)", children: /* @__PURE__ */ jsx10(
        "path",
        {
          d: isSpeaking ? speakingWave : idleWave,
          fill: "none",
          stroke: "#4F80FF",
          strokeWidth: "2",
          strokeLinecap: "round",
          filter: "url(#glow-effect)",
          children: isSpeaking ? /* @__PURE__ */ jsx10(
            "animateTransform",
            {
              attributeName: "transform",
              type: "translate",
              from: "0, 0",
              to: "-60, 0",
              dur: "0.8s",
              repeatCount: "indefinite"
            }
          ) : /* @__PURE__ */ jsx10(
            "animate",
            {
              attributeName: "d",
              dur: "4s",
              repeatCount: "indefinite",
              values: `${idleWave};${idleWavePulse1};${idleWavePulse2};${idleWave}`
            }
          )
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent", children: [
      /* @__PURE__ */ jsx10("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx10("span", { className: "text-sm font-medium", children: "AI Interviewer" }) }),
      status && /* @__PURE__ */ jsx10("span", { className: "text-xs text-slate-400", children: status })
    ] }),
    isSpeaking && /* @__PURE__ */ jsxs8("div", { className: "absolute top-3 left-3 flex items-center justify-center", "aria-label": "AI is speaking", role: "status", children: [
      /* @__PURE__ */ jsx10("div", { className: "absolute h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping" }),
      /* @__PURE__ */ jsx10("div", { className: "relative h-3 w-3 rounded-full bg-blue-500" })
    ] })
  ] });
};
var AudioVisualizer_default = AudioVisualizer;

// components/FeaturePlaceholders.tsx
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
var ChatInterviewPlaceholder = () => /* @__PURE__ */ jsxs9("div", { className: "w-full h-full p-4 flex flex-col gap-2 overflow-hidden", children: [
  /* @__PURE__ */ jsx11("div", { className: "p-2 rounded-lg bg-slate-700 self-start max-w-[70%] animate-fade-in-chat", style: { animationDelay: "0.5s" }, children: /* @__PURE__ */ jsx11("p", { className: "text-xs text-slate-300", children: "Tell me about a challenging project you've worked on." }) }),
  /* @__PURE__ */ jsx11("div", { className: "p-2 rounded-lg bg-blue-600 self-end max-w-[70%] animate-fade-in-chat", style: { animationDelay: "2s" }, children: /* @__PURE__ */ jsx11("p", { className: "text-xs text-white", children: "Sure! In my previous role, I was tasked with..." }) }),
  /* @__PURE__ */ jsx11("div", { className: "p-2 rounded-lg bg-slate-700 self-start max-w-[70%] animate-fade-in-chat", style: { animationDelay: "3.5s" }, children: /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsx11("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0s" } }),
    /* @__PURE__ */ jsx11("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0.2s" } }),
    /* @__PURE__ */ jsx11("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0.4s" } })
  ] }) }),
  /* @__PURE__ */ jsx11("style", { children: `
          @keyframes fade-in-chat {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-chat {
              animation: fade-in-chat 0.5s ease-out forwards;
              opacity: 0;
          }
      ` })
] });

// constants/media.ts
var IMAGE_BASE_URL = "https://storage.googleapis.com/jdlabs_images/images";
var VIDEO_BASE_URL = "https://storage.googleapis.com/jdlabs_images/videos";
var HERO_VIDEO_URL = `${VIDEO_BASE_URL}/hero-background.mp4`;
var VIDEO_INTERVIEW_URL = `${VIDEO_BASE_URL}/video-interview-demo.mp4`;
var AUDIO_INTERVIEW_URL = `${VIDEO_BASE_URL}/audio-interview-demo.mp4`;
var COMMUNITY_EFFICIENCY_VIDEO = `${VIDEO_BASE_URL}/AI People in English.mp4`;
var COMMUNITY_BIAS_VIDEO = `${VIDEO_BASE_URL}/JD Labs website Video.mp4`;
var COMMUNITY_ANALYSIS_VIDEO = `${VIDEO_BASE_URL}/Ai People in AD.mp4`;
var HERO_IMAGES = [
  `${IMAGE_BASE_URL}/c0001.jpg`,
  `${IMAGE_BASE_URL}/c0002.jpg`,
  `${IMAGE_BASE_URL}/c0003.jpg`,
  `${IMAGE_BASE_URL}/c0004.jpg`,
  `${IMAGE_BASE_URL}/c0005.jpg`,
  `${IMAGE_BASE_URL}/c0006.jpg`
];
var AI_INTERVIEWER_IMAGES = [
  `${IMAGE_BASE_URL}/c0002.jpg`,
  `${IMAGE_BASE_URL}/c0003.jpg`,
  `${IMAGE_BASE_URL}/c0005.jpg`
];
var PERFORMANCE_TRACKING_IMAGES = [
  `${IMAGE_BASE_URL}/a0007.jpg`,
  `${IMAGE_BASE_URL}/a0003.jpg`,
  `${IMAGE_BASE_URL}/a0004.jpg`,
  `${IMAGE_BASE_URL}/a0005.jpg`,
  `${IMAGE_BASE_URL}/a0006.jpg`,
  `${IMAGE_BASE_URL}/a0008.jpg`
];
var SCREEN_SHARE_IMAGES = [
  `${IMAGE_BASE_URL}/b0001.jpg`,
  `${IMAGE_BASE_URL}/b0002.jpg`,
  `${IMAGE_BASE_URL}/b0003.jpg`,
  `${IMAGE_BASE_URL}/b0004.jpg`,
  `${IMAGE_BASE_URL}/b0005.jpg`,
  `${IMAGE_BASE_URL}/b0006.jpg`,
  `${IMAGE_BASE_URL}/b0007.jpg`,
  `${IMAGE_BASE_URL}/b0008.jpg`
];

// components/SetupScreen.tsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
var ModeButton = ({ modeName, description, tag, tagClass, activeMode, setMode }) => /* @__PURE__ */ jsxs10(
  "button",
  {
    type: "button",
    onClick: () => setMode(modeName),
    className: `w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${activeMode === modeName ? "bg-blue-500/20 border-blue-500" : "bg-slate-700/50 border-slate-600 hover:border-slate-500"}`,
    children: [
      /* @__PURE__ */ jsxs10("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx12("span", { className: "font-semibold text-slate-200 text-sm", children: modeName }),
        /* @__PURE__ */ jsx12("span", { className: `text-xs font-bold px-1.5 py-0.5 rounded-full ${tagClass}`, children: tag })
      ] }),
      /* @__PURE__ */ jsx12("p", { className: "text-xs text-slate-400 mt-1", children: description })
    ]
  }
);
var SetupScreen = ({ onStartInterview, modelSettings: modelSettings2, currentUser, onLoginRequired }) => {
  const [jobs, setJobs] = useState9([]);
  const [languages, setLanguages] = useState9([]);
  const [selectedJobId, setSelectedJobId] = useState9(TRENDING_JOBS_DATA[0].id);
  const [jobDescription, setJobDescription] = useState9(TRENDING_JOBS_DATA[0].description);
  const [position, setPosition] = useState9(TRENDING_JOBS_DATA[0].title);
  const [jdUrl, setJdUrl] = useState9("");
  const [isFetchingJd, setIsFetchingJd] = useState9(false);
  const [mode, setMode] = useState9(InterviewMode.VIDEO);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState9("en-US");
  const [difficulty, setDifficulty] = useState9("Medium");
  const { showToast } = useToast();
  const formRef = useRef7(null);
  const displayJobs = jobs.length > 0 ? jobs : TRENDING_JOBS_DATA;
  const carouselTitle = currentUser && jobs.length > 0 ? "Your Job Postings" : "Practice with Sample Jobs";
  useEffect9(() => {
    const fetchData = async () => {
      const fetchedLanguages = await getLanguages();
      setLanguages(fetchedLanguages);
      const allJobs = await getJobs();
      setJobs(allJobs);
      if (allJobs.length > 0) {
        const defaultJob = allJobs[0];
        setSelectedJobId(defaultJob.id);
        setJobDescription(defaultJob.description);
        setPosition(defaultJob.title);
      } else {
        const defaultJob = TRENDING_JOBS_DATA[0];
        setSelectedJobId(defaultJob.id);
        setJobDescription(defaultJob.description);
        setPosition(defaultJob.title);
      }
    };
    fetchData();
  }, [currentUser]);
  const handleJobChange = (jobId) => {
    const selectedJob = displayJobs.find((j) => j.id === jobId);
    if (selectedJob) {
      setSelectedJobId(selectedJob.id);
      setJobDescription(selectedJob.description);
      setPosition(selectedJob.title);
    }
  };
  const handleSelectJob = (job) => {
    setJobDescription(job.description);
    setPosition(job.title);
    setSelectedJobId(job.id);
  };
  const getModelForMode = (selectedMode) => {
    switch (selectedMode) {
      case InterviewMode.CHAT:
        return modelSettings2.chat;
      case InterviewMode.AUDIO:
        return modelSettings2.audio;
      case InterviewMode.VIDEO:
        return modelSettings2.video;
      case InterviewMode.LIVE_SHARE:
        return modelSettings2.liveShare;
      default:
        return modelSettings2.chat;
    }
  };
  const handleFetchJd = async () => {
    if (!jdUrl.trim())
      return;
    setIsFetchingJd(true);
    try {
      const text = await extractTextFromUrl({ model: modelSettings2.chat, url: jdUrl });
      setJobDescription(text);
      setPosition("Custom Role from URL");
      setSelectedJobId("");
      showToast("Job description extracted successfully!", "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(`Failed to extract JD: ${errorMessage}`, "error");
    } finally {
      setIsFetchingJd(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      onLoginRequired();
      return;
    }
    const model = getModelForMode(mode);
    onStartInterview({
      candidateName: currentUser.name,
      position,
      jobDescription,
      mode,
      language: selectedLanguageCode,
      difficulty,
      model
    });
  };
  return /* @__PURE__ */ jsxs10("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black", children: [
    /* @__PURE__ */ jsx12("div", { className: "text-center mb-6 animate-fade-in-down", children: /* @__PURE__ */ jsxs10("div", { className: "inline-block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full py-1.5 px-4 text-sm text-slate-300", children: [
      "\u2728 ",
      /* @__PURE__ */ jsx12("span", { className: "font-semibold text-blue-400", children: "New Feature:" }),
      " Now with Live Screen Sharing for technical interviews!"
    ] }) }),
    /* @__PURE__ */ jsxs10("div", { className: "w-full max-w-5xl mx-auto z-10 text-center pt-2 pb-8 md:pt-0 md:pb-12", children: [
      /* @__PURE__ */ jsx12("h1", { className: "text-4xl md:text-5xl font-bold text-slate-100 animate-fade-in-down", style: { animationDelay: "0.2s" }, children: "AI Interview Platform" }),
      /* @__PURE__ */ jsx12("p", { className: "mt-4 text-lg text-slate-300 max-w-2xl mx-auto animate-fade-in-down", style: { animationDelay: "0.4s" }, children: "Streamline hiring with AI-powered video, live, audio and chat interviews" })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "w-full max-w-5xl mx-auto mb-8 md:mb-12 animate-fade-in-up", style: { animationDelay: "0.6s" }, children: [
      /* @__PURE__ */ jsx12("h2", { className: "text-2xl font-semibold text-center mb-4", children: carouselTitle }),
      /* @__PURE__ */ jsx12(JobCarousel_default, { jobs: displayJobs, onSelect: handleSelectJob })
    ] }),
    /* @__PURE__ */ jsx12("div", { className: "w-full max-w-5xl mx-auto", children: /* @__PURE__ */ jsxs10("form", { ref: formRef, onSubmit: handleSubmit, className: "bg-slate-800/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/20 border border-slate-700 transition-colors duration-300 ease-out hover:border-blue-500/50 animate-fade-in-up", style: { animationDelay: "0.8s" }, children: [
      /* @__PURE__ */ jsxs10("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs10("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs10("div", { children: [
            /* @__PURE__ */ jsxs10("label", { htmlFor: "jobDescription", className: "flex items-center gap-2 text-base font-bold text-slate-300 mb-2", children: [
              /* @__PURE__ */ jsx12("span", { className: "text-blue-400", children: /* @__PURE__ */ jsx12(PencilIcon, {}) }),
              "Job Description (JD)"
            ] }),
            /* @__PURE__ */ jsx12("textarea", { id: "jobDescription", value: jobDescription, onChange: (e) => setJobDescription(e.target.value), rows: 8, className: "w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Paste the job description here...", required: true }),
            /* @__PURE__ */ jsxs10("div", { className: "flex gap-2 mt-2", children: [
              /* @__PURE__ */ jsx12("input", { type: "url", value: jdUrl, onChange: (e) => setJdUrl(e.target.value), placeholder: "...or provide a link to it", className: "flex-1 bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" }),
              /* @__PURE__ */ jsx12("button", { type: "button", onClick: handleFetchJd, disabled: isFetchingJd, className: "bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-wait disabled:shadow-none", children: isFetchingJd ? "..." : "Fetch" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { className: "relative flex items-center", children: [
            /* @__PURE__ */ jsx12("div", { className: "flex-grow border-t border-slate-600" }),
            /* @__PURE__ */ jsx12("span", { className: "flex-shrink mx-4 text-slate-500 text-xs font-semibold", children: "OR" }),
            /* @__PURE__ */ jsx12("div", { className: "flex-grow border-t border-slate-600" })
          ] }),
          /* @__PURE__ */ jsxs10("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs10("div", { children: [
              /* @__PURE__ */ jsxs10("label", { htmlFor: "position", className: "flex items-center gap-2 text-base font-bold text-slate-300 mb-2", children: [
                /* @__PURE__ */ jsx12("span", { className: "text-blue-400", children: /* @__PURE__ */ jsx12(BriefcaseIcon, {}) }),
                "Select Job"
              ] }),
              /* @__PURE__ */ jsx12("select", { id: "position", value: selectedJobId, onChange: (e) => handleJobChange(e.target.value), className: "w-full bg-slate-700/50 border border-slate-600 rounded-md py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: displayJobs.length === 0, children: displayJobs.length > 0 ? displayJobs.map((j) => /* @__PURE__ */ jsx12("option", { value: j.id, children: j.title }, j.id)) : /* @__PURE__ */ jsx12("option", { children: "No jobs found" }) })
            ] }),
            /* @__PURE__ */ jsxs10("div", { children: [
              /* @__PURE__ */ jsxs10("label", { htmlFor: "language", className: "flex items-center gap-2 text-base font-bold text-slate-300 mb-2", children: [
                /* @__PURE__ */ jsx12("span", { className: "text-blue-400", children: /* @__PURE__ */ jsx12(GlobeIcon, {}) }),
                "Language"
              ] }),
              /* @__PURE__ */ jsx12("select", { id: "language", value: selectedLanguageCode, onChange: (e) => setSelectedLanguageCode(e.target.value), className: "w-full bg-slate-700/50 border border-slate-600 rounded-md py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500", children: languages.map((l) => /* @__PURE__ */ jsx12("option", { value: l.code, children: l.name }, l.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs10("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs10("div", { children: [
            /* @__PURE__ */ jsxs10("label", { className: "flex items-center gap-2 text-base font-bold text-slate-300 mb-3", children: [
              /* @__PURE__ */ jsx12("span", { className: "text-blue-400", children: /* @__PURE__ */ jsx12(TargetIcon, {}) }),
              "Interview Mode"
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx12(ModeButton, { modeName: InterviewMode.VIDEO, description: "Full video call with AI Interviewer", tag: "Recommended", tagClass: "bg-blue-600 text-white", activeMode: mode, setMode }),
              /* @__PURE__ */ jsx12(ModeButton, { modeName: InterviewMode.LIVE_SHARE, description: "Live Audio with screen sharing for tasks", tag: "LIVE", tagClass: "bg-red-500 text-white", activeMode: mode, setMode }),
              /* @__PURE__ */ jsx12(ModeButton, { modeName: InterviewMode.AUDIO, description: "Voice-only conversation", tag: "VOICE", tagClass: "bg-purple-500 text-white", activeMode: mode, setMode }),
              /* @__PURE__ */ jsx12(ModeButton, { modeName: InterviewMode.CHAT, description: "Text-based chat session", tag: "TEXT", tagClass: "bg-gray-500 text-white", activeMode: mode, setMode })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { children: [
            /* @__PURE__ */ jsxs10("label", { className: "flex items-center gap-2 text-base font-bold text-slate-300 mb-3", children: [
              /* @__PURE__ */ jsx12("span", { className: "text-blue-400", children: /* @__PURE__ */ jsx12(SignalIcon, {}) }),
              "Interview Difficulty"
            ] }),
            /* @__PURE__ */ jsx12("div", { className: "flex w-full rounded-md bg-slate-700/50 p-1", children: ["Easy", "Medium", "Hard"].map((level) => /* @__PURE__ */ jsx12(
              "button",
              {
                type: "button",
                onClick: () => setDifficulty(level),
                className: `w-full rounded py-1.5 text-sm font-semibold transition-colors ${difficulty === level ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-slate-600/50"}`,
                children: level
              },
              level
            )) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx12("div", { className: "mt-8 pt-6 border-t border-slate-700", children: /* @__PURE__ */ jsx12("button", { type: "submit", className: "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]", children: "Start Interview" }) })
    ] }) }),
    /* @__PURE__ */ jsxs10("div", { className: "w-full max-w-6xl mx-auto mt-16 md:mt-24", children: [
      /* @__PURE__ */ jsxs10("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx12("h2", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Our Features" }),
        /* @__PURE__ */ jsx12("p", { className: "text-slate-400 mt-4 text-lg max-w-3xl mx-auto", children: "Leverage cutting-edge AI to conduct comprehensive and insightful interviews for any role." })
      ] }),
      /* @__PURE__ */ jsxs10("div", { className: "space-y-16", children: [
        /* @__PURE__ */ jsx12(
          FeatureCard_default,
          {
            title: "Video Interview",
            icon: /* @__PURE__ */ jsx12(VideoCameraIcon, {}),
            media: /* @__PURE__ */ jsx12(MediaContainer_default, { children: /* @__PURE__ */ jsx12(ImageSlider_default, { images: HERO_IMAGES }) }),
            children: /* @__PURE__ */ jsx12("p", { children: "Engage with candidates in a realistic, face-to-face interview simulation powered by our advanced AI. Assess verbal and non-verbal cues for a complete picture." })
          }
        ),
        /* @__PURE__ */ jsx12(
          FeatureCard_default,
          {
            title: "Audio Interview",
            icon: /* @__PURE__ */ jsx12(MicOnIcon, {}),
            reverseLayout: true,
            media: /* @__PURE__ */ jsx12(MediaContainer_default, { children: /* @__PURE__ */ jsx12(AudioVisualizer_default, { isSpeaking: true }) }),
            children: /* @__PURE__ */ jsx12("p", { children: "Conduct voice-only interviews perfect for initial screenings or roles where verbal communication is key. Our AI provides real-time transcription and analysis." })
          }
        ),
        /* @__PURE__ */ jsx12(
          FeatureCard_default,
          {
            title: "Live Screen Sharing",
            icon: /* @__PURE__ */ jsx12(ShareIcon, {}),
            media: /* @__PURE__ */ jsx12(MediaContainer_default, { children: /* @__PURE__ */ jsx12(ImageSlider_default, { images: SCREEN_SHARE_IMAGES }) }),
            children: /* @__PURE__ */ jsx12("p", { children: "Evaluate technical skills in real-time. Candidates can share their screen to tackle coding challenges, demonstrate software proficiency, or walk through portfolios." })
          }
        ),
        /* @__PURE__ */ jsx12(
          FeatureCard_default,
          {
            title: "Chat Interview",
            icon: /* @__PURE__ */ jsx12(ChatBubbleIcon, {}),
            reverseLayout: true,
            media: /* @__PURE__ */ jsx12(MediaContainer_default, { children: /* @__PURE__ */ jsx12(ChatInterviewPlaceholder, {}) }),
            children: /* @__PURE__ */ jsx12("p", { children: "A text-based interview format ideal for assessing written communication skills and for candidates in environments where video/audio is not feasible." })
          }
        ),
        /* @__PURE__ */ jsx12(
          FeatureCard_default,
          {
            title: "Performance Tracking",
            icon: /* @__PURE__ */ jsx12(ChartBarIcon, {}),
            media: /* @__PURE__ */ jsx12(MediaContainer_default, { children: /* @__PURE__ */ jsx12(ImageSlider_default, { images: PERFORMANCE_TRACKING_IMAGES }) }),
            children: /* @__PURE__ */ jsx12("p", { children: "Receive detailed, AI-generated reports after each interview. Our analytics cover technical proficiency, communication skills, confidence levels, and more, with data-driven insights to help you make the best hiring decisions." })
          }
        )
      ] })
    ] })
  ] });
};
var SetupScreen_default = SetupScreen;

// components/LoginScreen.tsx
import { useState as useState10 } from "react";
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var LoginScreen = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState10("");
  const [password, setPassword] = useState10("");
  const [error, setError] = useState10("");
  const [isLoading, setIsLoading] = useState10(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("\u{1F510} Starting sign-in process");
    setIsLoading(true);
    setError("");
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Sign-in timeout: Request took too long")), 6e4);
      });
      console.log("\u{1F4E1} Calling supabaseService.signIn");
      const authPromise = signIn(email, password);
      const { user, session, error: signInError } = await Promise.race([authPromise, timeoutPromise]);
      if (signInError) {
        throw signInError;
      }
      if (!user || !session) {
        throw new Error("Sign-in failed: No user or session returned");
      }
      console.log("\u{1F389} Sign-in API call successful, user:", user.email);
      showToast("Login successful! Redirecting...", "success");
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/");
    } catch (error2) {
      console.error("\u{1F6A8} Sign-in error:", error2);
      if (error2.message?.includes("timeout")) {
        setError("Sign-in timed out. Please check your connection and try again.");
      } else if (error2.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (error2.message?.includes("Email not confirmed")) {
        setError("Please verify your email address before signing in.");
      } else if (error2.message?.toLowerCase().includes("network")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(error2.message || "Sign-in failed. Please try again.");
      }
    } finally {
      console.log("\u{1F504} Clearing loading state");
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    const { error: error2 } = await signInWithGoogle();
    if (error2) {
      showToast(`Google Sign-In Error: ${error2.message}`, "error");
    }
  };
  return /* @__PURE__ */ jsx13("div", { className: "flex-1 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs11("div", { className: "max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700", children: [
    /* @__PURE__ */ jsxs11("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx13("div", { className: "inline-block mb-4", children: /* @__PURE__ */ jsx13(Logo_default, {}) }),
      /* @__PURE__ */ jsx13("h2", { className: "text-3xl font-bold text-white", children: "Login to Your Account" }),
      /* @__PURE__ */ jsx13("p", { className: "text-slate-400 mt-2", children: "Welcome back! Please enter your details." })
    ] }),
    /* @__PURE__ */ jsxs11("form", { onSubmit: handleLogin, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs11("div", { children: [
        /* @__PURE__ */ jsx13("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: "w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            placeholder: "you@example.com",
            "aria-label": "Email Address",
            disabled: isLoading
          }
        )
      ] }),
      /* @__PURE__ */ jsxs11("div", { children: [
        /* @__PURE__ */ jsx13("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Password" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: "w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
            "aria-label": "Password",
            disabled: isLoading
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx13("p", { className: "text-red-500 text-sm text-center", children: error }),
      /* @__PURE__ */ jsxs11(
        "button",
        {
          type: "submit",
          disabled: isLoading,
          className: "w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-wait",
          children: [
            isLoading && /* @__PURE__ */ jsx13("div", { className: "w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" }),
            isLoading ? "Signing In..." : "Sign In"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs11("div", { className: "relative my-6", children: [
      /* @__PURE__ */ jsx13("div", { className: "absolute inset-0 flex items-center", "aria-hidden": "true", children: /* @__PURE__ */ jsx13("div", { className: "w-full border-t border-slate-600" }) }),
      /* @__PURE__ */ jsx13("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsx13("span", { className: "px-2 bg-slate-800 text-slate-400", children: "OR" }) })
    ] }),
    /* @__PURE__ */ jsxs11("button", { onClick: handleGoogleSignIn, className: "w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors", children: [
      /* @__PURE__ */ jsx13(GoogleIcon, {}),
      /* @__PURE__ */ jsx13("span", { className: "text-slate-200 font-semibold", children: "Sign in with Google" })
    ] }),
    /* @__PURE__ */ jsx13("div", { className: "text-center mt-6", children: /* @__PURE__ */ jsxs11("p", { className: "text-slate-400 text-sm", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx13(
        Link,
        {
          to: "/register",
          onClick: (e) => {
            e.preventDefault();
            onSwitchToRegister();
          },
          className: "text-blue-400 hover:text-blue-300 font-semibold underline transition-colors duration-200",
          children: "Register Now"
        }
      )
    ] }) })
  ] }) });
};
var LoginScreen_default = LoginScreen;

// components/RegisterScreen.tsx
import { useState as useState11 } from "react";
import { jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
var RegisterScreen = ({ onSwitchToLogin, onBackToSetup }) => {
  const [name, setName] = useState11("");
  const [email, setEmail] = useState11("");
  const [password, setPassword] = useState11("");
  const [error, setError] = useState11("");
  const [isLoading, setIsLoading] = useState11(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    const { error: signUpError } = await signUp(name, email, password);
    setIsLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      showToast("Registration successful! Please check your email to verify your account.", "success");
      navigate("/login");
    }
  };
  return /* @__PURE__ */ jsx14("div", { className: "flex-1 flex flex-col items-center justify-center p-4", children: /* @__PURE__ */ jsxs12("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs12("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx14("div", { className: "inline-block mb-4", children: /* @__PURE__ */ jsx14(Logo_default, {}) }),
      /* @__PURE__ */ jsx14("h1", { className: "text-3xl font-bold text-slate-100", children: "Create a New Account" }),
      /* @__PURE__ */ jsx14("p", { className: "text-slate-400 mt-2", children: "Join the AI Interview Platform today." })
    ] }),
    /* @__PURE__ */ jsxs12("div", { className: "bg-slate-800 p-8 rounded-lg border border-slate-700", children: [
      /* @__PURE__ */ jsxs12("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs12("div", { children: [
          /* @__PURE__ */ jsx14("label", { htmlFor: "name", className: "block text-sm font-medium text-slate-300 mb-2", children: "Full Name" }),
          /* @__PURE__ */ jsxs12("div", { className: "relative", children: [
            /* @__PURE__ */ jsx14("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400", children: /* @__PURE__ */ jsx14(UserIcon, {}) }),
            /* @__PURE__ */ jsx14(
              "input",
              {
                type: "text",
                id: "name",
                value: name,
                onChange: (e) => setName(e.target.value),
                disabled: isLoading,
                className: "w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                placeholder: "Your Name"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs12("div", { children: [
          /* @__PURE__ */ jsx14("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }),
          /* @__PURE__ */ jsxs12("div", { className: "relative", children: [
            /* @__PURE__ */ jsx14("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400", children: /* @__PURE__ */ jsx14(AtSymbolIcon, {}) }),
            /* @__PURE__ */ jsx14(
              "input",
              {
                type: "email",
                id: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                disabled: isLoading,
                className: "w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                placeholder: "you@example.com"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs12("div", { children: [
          /* @__PURE__ */ jsx14("label", { htmlFor: "password", className: "block text-sm font-medium text-slate-300 mb-2", children: "Password" }),
          /* @__PURE__ */ jsxs12("div", { className: "relative", children: [
            /* @__PURE__ */ jsx14("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400", children: /* @__PURE__ */ jsx14(LockClosedIcon, {}) }),
            /* @__PURE__ */ jsx14(
              "input",
              {
                type: "password",
                id: "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                disabled: isLoading,
                className: "w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              }
            )
          ] })
        ] }),
        error && /* @__PURE__ */ jsx14("p", { className: "text-red-500 text-sm text-center", children: error }),
        /* @__PURE__ */ jsxs12(
          "button",
          {
            type: "submit",
            disabled: isLoading,
            className: "w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-wait",
            children: [
              isLoading && /* @__PURE__ */ jsx14("div", { className: "w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" }),
              isLoading ? "Creating Account..." : "Create Account"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("p", { className: "text-center text-sm text-slate-400 mt-6", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx14(Link, { to: "/login", onClick: (e) => {
          e.preventDefault();
          onSwitchToLogin();
        }, className: "font-medium text-blue-400 hover:text-blue-300", children: "Login here" })
      ] })
    ] }),
    /* @__PURE__ */ jsx14("div", { className: "text-center mt-6", children: /* @__PURE__ */ jsx14(Link, { to: "/", onClick: (e) => {
      e.preventDefault();
      onBackToSetup();
    }, className: "text-sm text-slate-400 hover:text-slate-200", children: "\u2190 Back to Interview Setup" }) })
  ] }) });
};
var RegisterScreen_default = RegisterScreen;

// components/InterviewScreen.tsx
import { useState as useState16, useEffect as useEffect15, useMemo as useMemo5, useRef as useRef13, useCallback as useCallback8 } from "react";

// hooks/useCamera.ts
import { useState as useState12, useEffect as useEffect10, useRef as useRef8 } from "react";
var useUserMedia = (options) => {
  const { enabled, video, audio } = options;
  const [stream, setStream] = useState12(null);
  const [error, setError] = useState12(null);
  const streamRef = useRef8(null);
  useEffect10(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
      }
      return;
    }
    let isEffectActive = true;
    const getMedia = async () => {
      const constraints = { video, audio };
      if (!video && !audio)
        return;
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isEffectActive) {
          streamRef.current = mediaStream;
          setStream(mediaStream);
        } else {
          mediaStream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        if (isEffectActive) {
          console.error("Error accessing user media:", err);
          let title = "Media Access Error";
          let message = "An unexpected error occurred while accessing your media devices.";
          if (err instanceof DOMException) {
            switch (err.name) {
              case "NotAllowedError":
                title = "Permission Denied";
                message = "Access to the camera and/or microphone was denied. Please check your browser's permissions for this site. You can usually find this by clicking the lock icon next to the address bar.";
                break;
              case "NotFoundError":
                title = "Device Not Found";
                message = "No camera and/or microphone was found. Please ensure your devices are connected correctly and are not disabled in your system settings.";
                break;
              case "NotReadableError":
              case "OverconstrainedError":
                title = "Device In Use";
                message = "Your camera or microphone is already in use by another application or tab. Please close any other programs or tabs that might be using them and try again.";
                break;
              case "AbortError":
                title = "Access Aborted";
                message = "Media access was aborted, possibly because another device or application started using it. Please try again.";
                break;
              default:
                title = "Unexpected Error";
                message = `An error occurred: ${err.name}. Please try refreshing the page.`;
                break;
            }
            setError({ name: err.name, title, message });
          } else {
            setError({ name: "UnknownError", title: "Unknown Error", message: "An unknown error occurred. Please ensure you are using a modern browser with camera/microphone support." });
          }
        }
      }
    };
    getMedia();
    return () => {
      isEffectActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [enabled, video, audio]);
  return { stream, error };
};

// hooks/useAudioRecorder.ts
import { useState as useState13, useRef as useRef9, useCallback as useCallback6, useEffect as useEffect11 } from "react";
var useAudioRecorder = (stream) => {
  const [recordingStatus, setRecordingStatus] = useState13("idle");
  const [audioUrl, setAudioUrl] = useState13(null);
  const [audioBlob, setAudioBlob] = useState13(null);
  const mediaRecorderRef = useRef9(null);
  const audioChunksRef = useRef9([]);
  const [dedicatedAudioStream, setDedicatedAudioStream] = useState13(null);
  useEffect11(() => {
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTracks = stream.getAudioTracks();
      const newAudioStream = new MediaStream(audioTracks);
      setDedicatedAudioStream(newAudioStream);
    } else {
      setDedicatedAudioStream(null);
    }
    return () => {
      if (dedicatedAudioStream) {
        dedicatedAudioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);
  const startRecording = useCallback6(() => {
    if (!dedicatedAudioStream || recordingStatus !== "idle") {
      console.warn("Audio recording could not start: dedicated audio stream is missing or recorder is not idle.");
      return;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    audioChunksRef.current = [];
    try {
      const options = { mimeType: "audio/webm;codecs=opus" };
      const mediaRecorder = MediaRecorder.isTypeSupported(options.mimeType) ? new MediaRecorder(dedicatedAudioStream, options) : new MediaRecorder(dedicatedAudioStream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        setRecordingStatus("idle");
      };
      mediaRecorder.onstart = () => setRecordingStatus("recording");
      mediaRecorder.onpause = () => setRecordingStatus("paused");
      mediaRecorder.onresume = () => setRecordingStatus("recording");
      mediaRecorder.start();
    } catch (err) {
      console.error("Error starting audio recording:", err);
      setRecordingStatus("idle");
    }
  }, [dedicatedAudioStream, recordingStatus, audioUrl]);
  const stopRecording = useCallback6(() => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
    }
  }, []);
  const pauseRecording = useCallback6(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
  }, []);
  const resumeRecording = useCallback6(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
  }, []);
  useEffect11(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  return { recordingStatus, audioUrl, audioBlob, startRecording, stopRecording, pauseRecording, resumeRecording };
};

// hooks/useVideoRecorder.ts
import { useState as useState14, useRef as useRef10, useCallback as useCallback7, useEffect as useEffect12 } from "react";
var useVideoRecorder = (stream) => {
  const [recordingStatus, setRecordingStatus] = useState14("idle");
  const [videoUrl, setVideoUrl] = useState14(null);
  const [videoBlob, setVideoBlob] = useState14(null);
  const mediaRecorderRef = useRef10(null);
  const videoChunksRef = useRef10([]);
  const [recorderStream, setRecorderStream] = useState14(null);
  useEffect12(() => {
    if (stream && stream.active) {
      const newStream = new MediaStream(stream.getTracks());
      setRecorderStream(newStream);
    } else {
      setRecorderStream(null);
    }
    return () => {
      if (recorderStream) {
        recorderStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);
  const startRecording = useCallback7(() => {
    if (!recorderStream || recordingStatus !== "idle") {
      return;
    }
    if (recorderStream.getAudioTracks().length === 0) {
      console.warn("useVideoRecorder: The provided stream has no audio tracks. Recording video only.");
    }
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoBlob(null);
    videoChunksRef.current = [];
    try {
      const options = { mimeType: "video/webm; codecs=vp8,opus" };
      const mediaRecorder = MediaRecorder.isTypeSupported(options.mimeType) ? new MediaRecorder(recorderStream, options) : new MediaRecorder(recorderStream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setVideoBlob(blob);
        setRecordingStatus("idle");
      };
      mediaRecorder.onstart = () => setRecordingStatus("recording");
      mediaRecorder.onpause = () => setRecordingStatus("paused");
      mediaRecorder.onresume = () => setRecordingStatus("recording");
      mediaRecorder.start();
    } catch (err) {
      console.error("Error starting video recording:", err);
      setRecordingStatus("idle");
    }
  }, [recorderStream, recordingStatus, videoUrl]);
  const stopRecording = useCallback7(() => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
    }
  }, []);
  const pauseRecording = useCallback7(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
  }, []);
  const resumeRecording = useCallback7(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
  }, []);
  useEffect12(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  return { recordingStatus, videoUrl, videoBlob, startRecording, stopRecording, pauseRecording, resumeRecording };
};

// hooks/useScreenShare.ts
import { useState as useState15, useEffect as useEffect13, useRef as useRef11 } from "react";
var useScreenShare = (options) => {
  const { enabled } = options;
  const [stream, setStream] = useState15(null);
  const [error, setError] = useState15(null);
  const streamRef = useRef11(null);
  useEffect13(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
      }
      return;
    }
    let isEffectActive = true;
    const getMedia = async () => {
      try {
        setError(null);
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false
        });
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        if (isEffectActive) {
          const videoTrack = displayStream.getVideoTracks()[0];
          const audioTrack = audioStream.getAudioTracks()[0];
          videoTrack.onended = () => {
            if (isEffectActive) {
              audioTrack.stop();
              setStream(null);
              streamRef.current = null;
              setError({
                name: "ScreenShareEnded",
                title: "Screen Sharing Stopped",
                message: "You have stopped sharing your screen. To resume, please refresh the page and restart the interview."
              });
            }
          };
          const combinedStream = new MediaStream([videoTrack, audioTrack]);
          streamRef.current = combinedStream;
          setStream(combinedStream);
        } else {
          displayStream.getTracks().forEach((track) => track.stop());
          audioStream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        if (isEffectActive) {
          console.error("Error starting screen share:", err);
          let title = "Screen Share Error";
          let message = "An unexpected error occurred while trying to share your screen.";
          if (err instanceof DOMException) {
            switch (err.name) {
              case "NotAllowedError":
                title = "Permission Denied";
                message = "Screen sharing and/or microphone access was denied. Please check your browser's permissions and try again.";
                break;
              default:
                title = "Unexpected Error";
                message = `An error occurred: ${err.name}. Please try refreshing the page.`;
                break;
            }
            setError({ name: err.name, title, message });
          } else {
            setError({ name: "UnknownError", title: "Unknown Error", message: "An unknown error occurred." });
          }
        }
      }
    };
    getMedia();
    return () => {
      isEffectActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [enabled]);
  return { stream, error };
};

// components/VideoPanel.tsx
import { useRef as useRef12, useEffect as useEffect14 } from "react";
import { jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
var VideoPanel = ({ name, status, videoRef, avatarUrl, avatarNode, isMuted, isSpeaking, src }) => {
  const internalVideoRef = useRef12(null);
  useEffect14(() => {
    if (src && internalVideoRef.current) {
      if (isSpeaking) {
        internalVideoRef.current.play().catch((e) => console.error("Video play failed:", e));
      } else {
        internalVideoRef.current.pause();
      }
    }
  }, [isSpeaking, src]);
  return /* @__PURE__ */ jsxs13("div", { className: `relative w-full h-full bg-slate-950 rounded-lg overflow-hidden border-2 ${isSpeaking ? "border-blue-500" : "border-slate-700"} aspect-video transition-colors duration-300`, children: [
    isSpeaking && /* @__PURE__ */ jsxs13("div", { className: "absolute top-3 left-3 flex items-center justify-center", "aria-label": "AI is speaking", role: "status", children: [
      /* @__PURE__ */ jsx15("div", { className: "absolute h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping" }),
      /* @__PURE__ */ jsx15("div", { className: "relative h-3 w-3 rounded-full bg-blue-500" })
    ] }),
    src ? /* @__PURE__ */ jsx15(
      "video",
      {
        ref: internalVideoRef,
        src,
        loop: true,
        playsInline: true,
        muted: true,
        className: "w-full h-full object-cover",
        children: "Your browser does not support the video tag."
      }
    ) : videoRef ? /* @__PURE__ */ jsx15("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full h-full object-cover", muted: true }) : avatarUrl ? /* @__PURE__ */ jsx15("div", { className: "w-full h-full flex items-center justify-center bg-slate-800", children: /* @__PURE__ */ jsx15("img", { src: avatarUrl, alt: name, className: "w-32 h-32 rounded-full" }) }) : avatarNode ? /* @__PURE__ */ jsx15("div", { className: "w-full h-full flex items-center justify-center bg-slate-800", children: avatarNode }) : /* @__PURE__ */ jsx15("div", { className: "w-full h-full flex items-center justify-center bg-slate-800", children: /* @__PURE__ */ jsx15("span", { className: "text-slate-500", children: "No Video" }) }),
    /* @__PURE__ */ jsxs13("div", { className: "absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent", children: [
      /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx15("span", { className: "text-sm font-medium", children: name }),
        isMuted && /* @__PURE__ */ jsx15(MicOffIcon, {})
      ] }),
      status && /* @__PURE__ */ jsx15("span", { className: "text-xs text-slate-400", children: status })
    ] })
  ] });
};
var VideoPanel_default = VideoPanel;

// components/InterviewScreen.tsx
import { GoogleGenAI as GoogleGenAI2, Modality } from "@google/genai";
import { Fragment as Fragment8, jsx as jsx16, jsxs as jsxs14 } from "react/jsx-runtime";
function encode(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
async function decodeAudioData(data2, ctx, sampleRate, numChannels) {
  const dataInt16 = new Int16Array(data2.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768;
    }
  }
  return buffer;
}
function createBlob(data2) {
  const l = data2.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data2[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: "audio/pcm;rate=16000"
  };
}
var getApiErrorDetails = (error) => {
  const defaultMessage = "I'm sorry, an unexpected error occurred. Please try again later.";
  const rateLimitMessage = "The AI service is currently experiencing high demand. Retrying...";
  const quotaMessage = "You have reached the daily limit for this model. Please select a different model in the settings or try again tomorrow.";
  const processErrorObject = (apiError) => {
    const message = apiError.message || "";
    if (apiError.status === "RESOURCE_EXHAUSTED" || apiError.code === 429) {
      if (message.toLowerCase().includes("daily limit") || message.toLowerCase().includes("quota")) {
        return { type: "QUOTA_EXHAUSTED", message: quotaMessage };
      }
      return { type: "RATE_LIMIT", message: rateLimitMessage };
    }
    return { type: "OTHER", message: message || defaultMessage };
  };
  if (typeof error === "object" && error !== null && "error" in error) {
    return processErrorObject(error.error);
  }
  if (error instanceof Error && error.message) {
    try {
      const errorJson = JSON.parse(error.message);
      if (errorJson.error) {
        return processErrorObject(errorJson.error);
      }
    } catch (e) {
    }
    const message = error.message.toLowerCase();
    if (message.includes("resource_exhausted") || message.includes("429") || message.includes("rate limit")) {
      if (message.includes("daily limit") || message.includes("quota")) {
        return { type: "QUOTA_EXHAUSTED", message: quotaMessage };
      }
      return { type: "RATE_LIMIT", message: rateLimitMessage };
    }
    return { type: "OTHER", message: error.message };
  }
  return { type: "OTHER", message: defaultMessage };
};
var MediaErrorDisplay = ({ error, children }) => /* @__PURE__ */ jsxs14("div", { className: "bg-red-900/30 border-2 border-red-500/50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-full", role: "alert", children: [
  /* @__PURE__ */ jsx16("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 text-red-400 mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx16("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
  /* @__PURE__ */ jsx16("h3", { className: "text-xl font-bold text-red-300 mb-2", children: error.title }),
  /* @__PURE__ */ jsx16("p", { className: "text-red-300/90 max-w-md", children: error.message }),
  children && /* @__PURE__ */ jsx16("div", { className: "mt-6", children })
] });
var InterviewScreen = ({ interviewId, settings, onEndInterview }) => {
  const [questions, setQuestions] = useState16([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState16(0);
  const [isAiThinking, setIsAiThinking] = useState16(true);
  const [isEnding, setIsEnding] = useState16(false);
  const [chatHistory, setChatHistory] = useState16([]);
  const [qna, setQna] = useState16([]);
  const [currentMessage, setCurrentMessage] = useState16("");
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState16(false);
  const [notes, setNotes] = useState16("");
  const [isMuted, setIsMuted] = useState16(false);
  const [initError, setInitError] = useState16(null);
  const [retryStatus, setRetryStatus] = useState16(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState16(false);
  const [transcript, setTranscript] = useState16("");
  const { showToast } = useToast();
  const cameraVideoRef = useRef13(null);
  const screenShareVideoRef = useRef13(null);
  const INTERVIEW_DURATION = 180;
  const [timeLeft, setTimeLeft] = useState16(INTERVIEW_DURATION);
  const chatRef = useRef13(null);
  const sessionPromiseRef = useRef13(null);
  const aiRef = useRef13(null);
  const inputAudioContextRef = useRef13(null);
  const outputAudioContextRef = useRef13(null);
  const scriptProcessorRef = useRef13(null);
  const mediaStreamSourceRef = useRef13(null);
  const nextStartTimeRef = useRef13(0);
  const audioSourcesRef = useRef13(/* @__PURE__ */ new Set());
  const currentInputTranscriptionRef = useRef13("");
  const currentOutputTranscriptionRef = useRef13("");
  const chatContainerRef = useRef13(null);
  const malpracticeLogRef = useRef13([]);
  const lastActivityTimeRef = useRef13(Date.now());
  const isMutedRef = useRef13(isMuted);
  const hasInitialized = useRef13(false);
  useEffect15(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  const isVideoMode = settings.mode === InterviewMode.VIDEO;
  const isAudioMode = settings.mode === InterviewMode.AUDIO;
  const isLiveShareMode = settings.mode === InterviewMode.LIVE_SHARE;
  const isChatMode = settings.mode === InterviewMode.CHAT;
  const isAudioEnabled = isVideoMode || isAudioMode || isLiveShareMode;
  const currentQuestion = questions[currentQuestionIndex]?.text || (isAiThinking ? "Thinking..." : "Ready for your response.");
  const { stream: userMediaStream, error: cameraError } = useUserMedia({
    enabled: isVideoMode || isAudioMode,
    video: isVideoMode,
    audio: true
  });
  useEffect15(() => {
    if (cameraVideoRef.current && userMediaStream) {
      cameraVideoRef.current.srcObject = userMediaStream;
    }
  }, [userMediaStream]);
  const { stream: screenShareStream, error: screenShareError } = useScreenShare({
    enabled: isLiveShareMode
  });
  useEffect15(() => {
    if (screenShareVideoRef.current && screenShareStream) {
      screenShareVideoRef.current.srcObject = screenShareStream;
    }
  }, [screenShareStream]);
  const streamForRecorder = useMemo5(() => isLiveShareMode ? screenShareStream : userMediaStream, [isLiveShareMode, screenShareStream, userMediaStream]);
  const { recordingStatus: videoRecordingStatus, videoUrl, videoBlob, startRecording: startVideoRecording, stopRecording: stopVideoRecording } = useVideoRecorder(streamForRecorder);
  const { recordingStatus: audioRecordingStatus, audioUrl, audioBlob, startRecording: startAudioRecording, stopRecording: stopAudioRecording } = useAudioRecorder(streamForRecorder);
  const handleSendChatMessage = useCallback8(async () => {
    if (!currentMessage.trim() || isAiThinking || !chatRef.current)
      return;
    const userMessage = currentMessage;
    setChatHistory((prev) => [...prev, { author: "user", text: userMessage }]);
    setCurrentMessage("");
    setIsAiThinking(true);
    try {
      const aiResponse = await chatRef.current.sendMessage(userMessage);
      setChatHistory((prev) => [...prev, { author: "ai", text: aiResponse }]);
      setQuestions((prev) => [...prev, { id: String(prev.length + 1), text: aiResponse }]);
      setCurrentQuestionIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Chat error:", err);
      const errorDetails = getApiErrorDetails(err);
      setChatHistory((prev) => [...prev, { author: "ai", text: `Sorry, an error occurred: ${errorDetails.message}` }]);
    } finally {
      setIsAiThinking(false);
    }
  }, [currentMessage, isAiThinking]);
  const cleanupLiveSession = useCallback8(() => {
    sessionPromiseRef.current?.then((s) => s.close()).catch((e) => {
      if (!e.message.toLowerCase().includes("close")) {
        console.error("Error closing live session:", e);
      }
    });
    sessionPromiseRef.current = null;
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== "closed") {
      inputAudioContextRef.current.close().catch((e) => console.error("Error closing input audio context:", e));
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== "closed") {
      for (const source of audioSourcesRef.current.values()) {
        try {
          source.stop();
        } catch (err) {
        }
      }
      audioSourcesRef.current.clear();
      outputAudioContextRef.current.close().catch((e) => console.error("Error closing output audio context:", e));
    }
  }, []);
  const handleEndInterview = useCallback8(async () => {
    if (isEnding)
      return;
    setIsEnding(true);
    showToast("Finalizing your interview...", "info");
    cleanupLiveSession();
    if (isAudioEnabled) {
      if (isLiveShareMode || isVideoMode) {
        stopVideoRecording();
      } else {
        stopAudioRecording();
      }
    }
    const formatMalpracticeReport = () => {
      if (malpracticeLogRef.current.length === 0) {
        return null;
      }
      return malpracticeLogRef.current.map((log) => `[${log.timestamp}] ${log.type}: ${log.details}`).join("\n");
    };
    setTimeout(() => {
      let finalMediaBlob = null;
      if (isLiveShareMode || isVideoMode) {
        finalMediaBlob = videoBlob;
      } else if (isAudioMode) {
        finalMediaBlob = audioBlob;
      }
      const finalTranscript = isChatMode ? chatHistory.map((item) => `${item.author === "ai" ? "Interviewer" : "Candidate"}: ${item.text}`).join("\n\n") : transcript;
      const malpracticeReport = formatMalpracticeReport();
      let finalQna = qna;
      if (isChatMode) {
        finalQna = [];
        for (let i = 0; i < chatHistory.length; i += 2) {
          if (chatHistory[i]?.author === "ai" && chatHistory[i + 1]?.author === "user") {
            finalQna.push({ question: chatHistory[i].text, answer: chatHistory[i + 1].text });
          }
        }
      }
      onEndInterview({ interviewId, mediaBlob: finalMediaBlob, fullTranscript: finalTranscript, malpracticeReport, qna: finalQna });
    }, 1500);
  }, [isEnding, interviewId, isAudioEnabled, isVideoMode, isLiveShareMode, isChatMode, stopVideoRecording, stopAudioRecording, videoBlob, audioBlob, chatHistory, transcript, onEndInterview, showToast, cleanupLiveSession, qna]);
  useEffect15(() => {
    if (timeLeft <= 0) {
      if (!isEnding) {
        showToast("Time's up! Finishing the interview.", "info");
        handleEndInterview();
      }
      return;
    }
    if (isEnding)
      return;
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime > 0 ? prevTime - 1 : 0);
    }, 1e3);
    return () => clearInterval(timerId);
  }, [timeLeft, isEnding, handleEndInterview, showToast]);
  useEffect15(() => {
    if (isChatMode)
      return;
    let hiddenSince = null;
    const handleVisibilityChange = () => {
      if (isEnding)
        return;
      if (document.hidden) {
        hiddenSince = Date.now();
      } else {
        if (hiddenSince) {
          const duration = Math.round((Date.now() - hiddenSince) / 1e3);
          if (duration > 2) {
            const logEntry = {
              type: "Screen Switch",
              details: `Candidate switched tabs or minimized the window for ${duration} seconds.`,
              timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString()
            };
            malpracticeLogRef.current.push(logEntry);
            showToast(`Activity detected: Screen switched for ${duration}s`, "info");
          }
          hiddenSince = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showToast, isChatMode, isEnding]);
  useEffect15(() => {
    if (isChatMode || isEnding)
      return;
    const loggedPauses = /* @__PURE__ */ new Set();
    const interval = setInterval(() => {
      if (!isAiSpeaking) {
        const silenceDuration = Math.round((Date.now() - lastActivityTimeRef.current) / 1e3);
        const pauseTimestamp = lastActivityTimeRef.current;
        if (silenceDuration > 15 && !loggedPauses.has(pauseTimestamp)) {
          const logEntry = {
            type: "Long Pause",
            details: `Candidate was unresponsive for over 15 seconds.`,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString()
          };
          malpracticeLogRef.current.push(logEntry);
          showToast(`Activity detected: Long pause`, "info");
          loggedPauses.add(pauseTimestamp);
        }
      }
    }, 5e3);
    return () => clearInterval(interval);
  }, [isAiSpeaking, showToast, isChatMode, isEnding]);
  useEffect15(() => {
    if (hasInitialized.current)
      return;
    if (isAudioEnabled && !userMediaStream)
      return;
    if (false) {
      setInitError("API key is not configured. Please set it up to start the interview.");
      return;
    }
    hasInitialized.current = true;
    aiRef.current = new GoogleGenAI2({ apiKey: "AIzaSyDDjDns0923F5lbQMp1e9P_cmj1BInE89Q" });
    let retryCount = 0;
    const maxRetries = 3;
    const systemInstruction = `You are an expert AI interviewer. Your sole purpose is to conduct a professional, ${settings.difficulty} level interview for a "${settings.position}" role, based on this job description: "${settings.jobDescription}".

Your persona is that of a focused and objective hiring manager.

Your instructions are:
1.  **Start the interview:** Begin with a brief greeting and then immediately ask the first relevant interview question.
2.  **Stay On-Topic:** All your questions and responses must be directly related to assessing the candidate's skills and experience for the specified job.
3.  **One Question at a Time:** Ask only one question at a time and wait for the candidate's full response.
4.  **Handle Off-Topic Conversation:** If the candidate attempts to divert the conversation to topics not relevant to the interview (e.g., small talk, personal opinions on unrelated matters), you MUST politely but firmly redirect them back. When you do this, your response text MUST start with the exact tag "[DIVERSION_DETECTED]". Do not speak the tag itself, only use it in the text transcript. For example: "[DIVERSION_DETECTED] That's an interesting point, but for the purpose of this interview, let's focus on your technical skills."
5.  **Maintain Professionalism:** Do not engage in casual chat, tell jokes, or offer personal opinions. Your tone should be professional and neutral.
6.  **Language:** Conduct the interview in ${settings.language}.
7.  **Formatting:** Do not use markdown in your responses.`;
    const startInterview = async () => {
      try {
        setRetryStatus(retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : null);
        setIsAiThinking(true);
        setInitError(null);
        if (isChatMode) {
          chatRef.current = createChatSession({
            model: settings.model,
            systemInstruction
          });
          const firstQuestion = await chatRef.current.sendMessage("Hello, I am ready to start the interview.");
          setChatHistory([{ author: "ai", text: firstQuestion }]);
          setQuestions([{ id: "1", text: firstQuestion }]);
        } else if (isAudioEnabled && userMediaStream) {
          inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16e3 });
          outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24e3 });
          sessionPromiseRef.current = aiRef.current.live.connect({
            model: settings.model,
            config: {
              systemInstruction,
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } },
              inputAudioTranscription: {},
              outputAudioTranscription: {}
            },
            callbacks: {
              onopen: () => {
                if (!userMediaStream || !inputAudioContextRef.current)
                  return;
                mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(userMediaStream);
                scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current.onaudioprocess = (event) => {
                  const inputData = event.inputBuffer.getChannelData(0);
                  const pcmBlob = createBlob(inputData);
                  sessionPromiseRef.current?.then((session2) => {
                    if (!isMutedRef.current) {
                      session2.sendRealtimeInput({ media: pcmBlob });
                    }
                  });
                };
                mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
              },
              onmessage: async (message) => {
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                  setIsAiSpeaking(true);
                  const outCtx = outputAudioContextRef.current;
                  if (!outCtx)
                    return;
                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                  const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24e3, 1);
                  const source = outCtx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outCtx.destination);
                  source.addEventListener("ended", () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0)
                      setIsAiSpeaking(false);
                  });
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  audioSourcesRef.current.add(source);
                }
                if (message.serverContent?.inputTranscription?.text) {
                  lastActivityTimeRef.current = Date.now();
                  currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                }
                if (message.serverContent?.outputTranscription)
                  currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                if (message.serverContent?.turnComplete) {
                  const fullInput = currentInputTranscriptionRef.current.trim();
                  let fullOutput = currentOutputTranscriptionRef.current.trim();
                  if (fullInput)
                    setTranscript((prev) => `${prev}

Candidate: ${fullInput}`);
                  if (fullOutput) {
                    if (fullOutput.startsWith("[DIVERSION_DETECTED]")) {
                      const logEntry = {
                        type: "Topic Diversion",
                        details: "Candidate attempted to divert the conversation from the interview topic.",
                        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString()
                      };
                      malpracticeLogRef.current.push(logEntry);
                      showToast("Activity detected: Topic diversion", "info");
                      fullOutput = fullOutput.replace("[DIVERSION_DETECTED]", "").trim();
                    }
                    setTranscript((prev) => `${prev}

Interviewer: ${fullOutput}`);
                    setQuestions((prev) => [...prev, { id: String(prev.length + 1), text: fullOutput }]);
                    if (fullInput) {
                      setQna((prev) => [...prev, { question: fullOutput, answer: fullInput }]);
                    }
                    setCurrentQuestionIndex((prev) => prev + 1);
                    lastActivityTimeRef.current = Date.now();
                  }
                  currentInputTranscriptionRef.current = "";
                  currentOutputTranscriptionRef.current = "";
                }
                if (message.serverContent?.interrupted) {
                  for (const source of audioSourcesRef.current.values()) {
                    source.stop();
                    audioSourcesRef.current.delete(source);
                  }
                  nextStartTimeRef.current = 0;
                  setIsAiSpeaking(false);
                }
              },
              onerror: (e) => console.error("Live session error:", e),
              onclose: () => {
              }
            }
          });
          const session = await sessionPromiseRef.current;
          session.sendRealtimeInput({ media: createBlob(new Float32Array(160)) });
        }
      } catch (err) {
        console.error("Error starting interview:", err);
        const errorDetails = getApiErrorDetails(err);
        if (errorDetails.type === "RATE_LIMIT" && retryCount < maxRetries) {
          retryCount++;
          setTimeout(startInterview, 3e4 * retryCount);
        } else {
          setInitError(errorDetails.message);
        }
      } finally {
        if (!initError)
          setIsAiThinking(false);
      }
    };
    startInterview();
    return () => {
      cleanupLiveSession();
    };
  }, [settings, isAudioEnabled, userMediaStream, isChatMode, cleanupLiveSession]);
  useEffect15(() => {
    if (streamForRecorder && streamForRecorder.active) {
      if ((isVideoMode || isLiveShareMode) && videoRecordingStatus === "idle") {
        startVideoRecording();
      } else if (isAudioMode && audioRecordingStatus === "idle") {
        startAudioRecording();
      }
    }
  }, [streamForRecorder, isVideoMode, isLiveShareMode, isAudioMode, videoRecordingStatus, audioRecordingStatus, startVideoRecording, startAudioRecording]);
  useEffect15(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };
  const mediaError = cameraError || screenShareError;
  if (mediaError)
    return /* @__PURE__ */ jsx16("div", { className: "flex-1 flex items-center justify-center p-4", children: /* @__PURE__ */ jsx16(MediaErrorDisplay, { error: mediaError }) });
  if (isAiThinking && questions.length === 0) {
    return /* @__PURE__ */ jsxs14("div", { className: "flex-1 flex flex-col items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx16("div", { className: "w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin" }),
      /* @__PURE__ */ jsx16("p", { className: "text-slate-300 mt-4 text-lg", children: "Initializing AI Interviewer..." }),
      initError && /* @__PURE__ */ jsx16("p", { className: "text-red-400 mt-2 max-w-md text-center", children: initError }),
      retryStatus && /* @__PURE__ */ jsx16("p", { className: "text-yellow-400 mt-2", children: retryStatus })
    ] });
  }
  const renderMainContent = () => {
    if (isChatMode) {
      return /* @__PURE__ */ jsxs14("div", { className: "bg-slate-800 rounded-lg h-full flex flex-col border border-slate-700", children: [
        /* @__PURE__ */ jsxs14("div", { ref: chatContainerRef, className: "flex-1 p-4 overflow-y-auto space-y-4", children: [
          chatHistory.map((msg, index) => /* @__PURE__ */ jsx16("div", { className: `flex ${msg.author === "user" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsx16("div", { className: `p-3 rounded-lg max-w-[80%] ${msg.author === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-200"}`, children: /* @__PURE__ */ jsx16("p", { className: "text-sm", children: msg.text }) }) }, index)),
          isAiThinking && /* @__PURE__ */ jsx16("div", { className: "flex justify-start", children: /* @__PURE__ */ jsx16("div", { className: "p-3 rounded-lg bg-slate-700", children: /* @__PURE__ */ jsxs14("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx16("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0s" } }),
            /* @__PURE__ */ jsx16("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0.2s" } }),
            /* @__PURE__ */ jsx16("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0.4s" } })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx16("div", { className: "p-4 border-t border-slate-700", children: /* @__PURE__ */ jsxs14("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx16("textarea", { value: currentMessage, onChange: (e) => setCurrentMessage(e.target.value), onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendChatMessage();
            }
          }, placeholder: "Type your answer...", rows: 1, className: "flex-1 bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: isAiThinking }),
          /* @__PURE__ */ jsx16("button", { onClick: handleSendChatMessage, disabled: !currentMessage.trim() || isAiThinking, className: "bg-blue-600 hover:bg-blue-500 text-white rounded-md p-3 disabled:opacity-50 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsx16(SendIcon, {}) })
        ] }) })
      ] });
    }
    return /* @__PURE__ */ jsxs14(Fragment8, { children: [
      /* @__PURE__ */ jsx16("div", { className: "w-full h-full", children: isAudioMode ? /* @__PURE__ */ jsx16(AudioVisualizer_default, { isSpeaking: isAiSpeaking, status: isAiThinking ? "Thinking..." : "Listening..." }) : /* @__PURE__ */ jsx16(VideoPanel_default, { name: "AI Interviewer", isSpeaking: isAiSpeaking, status: isAiThinking ? "Thinking..." : "Listening...", avatarNode: /* @__PURE__ */ jsx16(ImageSlider_default, { images: AI_INTERVIEWER_IMAGES }) }) }),
      /* @__PURE__ */ jsx16("div", { className: "w-full h-full", children: isAudioMode ? /* @__PURE__ */ jsx16(VideoPanel_default, { name: settings.candidateName, avatarNode: /* @__PURE__ */ jsx16(UserCircleIcon, {}), isMuted }) : isLiveShareMode ? /* @__PURE__ */ jsx16(VideoPanel_default, { name: settings.candidateName, videoRef: screenShareVideoRef, status: "Sharing Screen", isMuted }) : (
        // Video mode
        /* @__PURE__ */ jsx16(VideoPanel_default, { name: settings.candidateName, videoRef: cameraVideoRef, isMuted })
      ) })
    ] });
  };
  return /* @__PURE__ */ jsxs14("div", { className: "flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-900", children: [
    /* @__PURE__ */ jsxs14("div", { className: "flex-1 flex flex-col p-4 gap-4", children: [
      /* @__PURE__ */ jsxs14("div", { className: "bg-slate-950/50 p-3 rounded-lg border border-slate-700 text-center flex-shrink-0", children: [
        /* @__PURE__ */ jsx16("p", { className: "text-sm text-slate-400 mb-1", children: "Current Question:" }),
        /* @__PURE__ */ jsx16("p", { className: "text-base font-semibold text-slate-100", children: currentQuestion })
      ] }),
      /* @__PURE__ */ jsx16("div", { className: "flex-1 grid grid-cols-1 md:grid-cols-2 gap-4", children: renderMainContent() }),
      /* @__PURE__ */ jsxs14("div", { className: "flex-shrink-0 flex items-center justify-center gap-4 mt-2", children: [
        isAudioEnabled && /* @__PURE__ */ jsx16("button", { onClick: () => setIsMuted((prev) => !prev), className: `p-3 rounded-full transition-colors ${isMuted ? "bg-red-600 hover:bg-red-500" : "bg-slate-700 hover:bg-slate-600"}`, children: isMuted ? /* @__PURE__ */ jsx16(MicOffIcon, {}) : /* @__PURE__ */ jsx16(MicOnIcon, {}) }),
        /* @__PURE__ */ jsx16("button", { onClick: handleEndInterview, disabled: isEnding, className: "bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait", children: isEnding ? "Ending..." : "End Interview" }),
        isAudioEnabled && /* @__PURE__ */ jsx16("button", { onClick: () => setIsSidePanelCollapsed((prev) => !prev), className: "p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors", children: /* @__PURE__ */ jsx16(SettingsIcon, {}) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs14("div", { className: `bg-slate-800 border-l border-slate-700 flex flex-col transition-all duration-300 ${isSidePanelCollapsed ? "w-0" : "w-full md:w-80"} overflow-hidden`, children: [
      /* @__PURE__ */ jsx16("div", { className: "p-4 border-b border-slate-700 flex-shrink-0", children: /* @__PURE__ */ jsx16("h2", { className: "text-lg font-bold text-slate-100", children: "Interview Tools" }) }),
      /* @__PURE__ */ jsxs14("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
        /* @__PURE__ */ jsxs14("div", { className: "bg-slate-700/50 p-3 rounded-lg flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs14("span", { className: "font-semibold text-slate-200 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx16(ClockIcon, { className: "h-5 w-5" }),
            " Time Left"
          ] }),
          /* @__PURE__ */ jsx16("span", { className: "font-mono text-lg", children: formatTime(timeLeft) })
        ] }),
        /* @__PURE__ */ jsxs14("div", { children: [
          /* @__PURE__ */ jsx16("label", { htmlFor: "notes", className: "block text-sm font-medium text-slate-300 mb-2", children: "My Notes" }),
          /* @__PURE__ */ jsx16(
            "textarea",
            {
              id: "notes",
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              className: "w-full h-48 bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
              placeholder: "Jot down your thoughts here..."
            }
          )
        ] })
      ] })
    ] })
  ] });
};
var InterviewScreen_default = InterviewScreen;

// components/PlaybackScreen.tsx
import { useState as useState17, useEffect as useEffect16 } from "react";

// components/FeedbackPanel.tsx
import { jsx as jsx17, jsxs as jsxs15 } from "react/jsx-runtime";
var getApiErrorDetails2 = (error) => {
  const defaultMessage = "Sorry, an error occurred while generating feedback. Please try again later.";
  const rateLimitMessage = "The AI service is currently experiencing high demand. Retrying...";
  const quotaMessage = "You have reached the daily limit for the evaluation model. To try again, please start a new interview and select a different evaluation model on the setup screen.";
  const processErrorObject = (apiError) => {
    const message = apiError.message || "";
    if (apiError.status === "RESOURCE_EXHAUSTED" || apiError.code === 429) {
      if (message.toLowerCase().includes("daily limit") || message.toLowerCase().includes("quota")) {
        return { type: "QUOTA_EXHAUSTED", message: quotaMessage };
      }
      return { type: "RATE_LIMIT", message: rateLimitMessage };
    }
    return { type: "OTHER", message: message || defaultMessage };
  };
  if (typeof error === "object" && error !== null && "error" in error) {
    return processErrorObject(error.error);
  }
  if (error instanceof Error && error.message) {
    try {
      const errorJson = JSON.parse(error.message);
      if (errorJson.error) {
        return processErrorObject(errorJson.error);
      }
    } catch (e) {
      const message = error.message.toLowerCase();
      if (message.includes("resource_exhausted") || message.includes("429") || message.includes("rate limit")) {
        if (message.includes("daily limit") || message.includes("quota")) {
          return { type: "QUOTA_EXHAUSTED", message: quotaMessage };
        }
        return { type: "RATE_LIMIT", message: rateLimitMessage };
      }
      return { type: "OTHER", message: error.message };
    }
  }
  return { type: "OTHER", message: defaultMessage };
};
var RatingCircle = ({ rating }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - rating / 10 * circumference;
  let colorClass = "text-green-400";
  if (rating < 5)
    colorClass = "text-red-400";
  else if (rating < 8)
    colorClass = "text-yellow-400";
  return /* @__PURE__ */ jsxs15("div", { className: "relative w-32 h-32", children: [
    /* @__PURE__ */ jsxs15("svg", { className: "w-full h-full", viewBox: "0 0 100 100", children: [
      /* @__PURE__ */ jsx17("circle", { className: "text-slate-700", strokeWidth: "10", stroke: "currentColor", fill: "transparent", r: "45", cx: "50", cy: "50" }),
      /* @__PURE__ */ jsx17(
        "circle",
        {
          className: `transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`,
          strokeWidth: "10",
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          strokeLinecap: "round",
          stroke: "currentColor",
          fill: "transparent",
          r: "45",
          cx: "50",
          cy: "50"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs15("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsx17("span", { className: `text-4xl font-bold ${colorClass}`, children: rating.toFixed(1) }),
      /* @__PURE__ */ jsx17("span", { className: "text-sm text-slate-400", children: "/ 10" })
    ] })
  ] });
};
var MetricBar = ({ metric }) => /* @__PURE__ */ jsxs15("div", { children: [
  /* @__PURE__ */ jsxs15("div", { className: "flex justify-between items-baseline mb-1", children: [
    /* @__PURE__ */ jsx17("span", { className: "text-sm font-medium text-slate-300", children: metric.name }),
    /* @__PURE__ */ jsxs15("span", { className: "text-sm font-bold text-slate-100", children: [
      metric.rating,
      "/10"
    ] })
  ] }),
  /* @__PURE__ */ jsx17("div", { className: "w-full bg-slate-700 rounded-full h-2.5", children: /* @__PURE__ */ jsx17("div", { className: "bg-blue-500 h-2.5 rounded-full", style: { width: `${metric.rating * 10}%` } }) }),
  /* @__PURE__ */ jsxs15("p", { className: "text-xs text-slate-400 mt-1.5 italic", children: [
    '"',
    metric.reasoning,
    '"'
  ] })
] });
var RecommendationBadge = ({ recommendation }) => {
  let bgColor, textColor, icon;
  switch (recommendation) {
    case "Recommended for Hire":
      bgColor = "bg-green-500/10";
      textColor = "text-green-400";
      icon = /* @__PURE__ */ jsx17(ThumbsUpIcon, {});
      break;
    case "Needs Improvement":
      bgColor = "bg-yellow-500/10";
      textColor = "text-yellow-400";
      icon = /* @__PURE__ */ jsx17(LightbulbIcon, {});
      break;
    case "Not a Fit":
    default:
      bgColor = "bg-red-500/10";
      textColor = "text-red-400";
      icon = /* @__PURE__ */ jsx17(ThumbsDownIcon, {});
      break;
  }
  return /* @__PURE__ */ jsxs15("div", { className: `p-3 rounded-lg flex items-center gap-3 ${bgColor}`, children: [
    /* @__PURE__ */ jsx17("div", { className: textColor, children: icon }),
    /* @__PURE__ */ jsxs15("div", { children: [
      /* @__PURE__ */ jsx17("h4", { className: "font-semibold text-slate-200", children: "Recommendation" }),
      /* @__PURE__ */ jsx17("p", { className: `font-bold ${textColor}`, children: recommendation })
    ] })
  ] });
};
var FeedbackPanel = ({ feedback, isLoading, error, loadingMessage }) => {
  if (isLoading) {
    return /* @__PURE__ */ jsxs15("div", { children: [
      /* @__PURE__ */ jsx17("h3", { className: "text-lg font-semibold text-slate-200 mb-2", children: "Generating AI Feedback..." }),
      /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-2 text-slate-400", children: [
        /* @__PURE__ */ jsx17("div", { className: "w-4 h-4 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin" }),
        /* @__PURE__ */ jsx17("span", { children: loadingMessage })
      ] })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs15("div", { children: [
      /* @__PURE__ */ jsx17("h3", { className: "text-lg font-semibold text-red-400 mb-2", children: "Error" }),
      /* @__PURE__ */ jsx17("p", { className: "text-red-400/90", children: error })
    ] });
  }
  if (!feedback) {
    return /* @__PURE__ */ jsxs15("div", { children: [
      /* @__PURE__ */ jsx17("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: "No Feedback Available" }),
      /* @__PURE__ */ jsx17("p", { className: "text-slate-400/90", children: "Could not generate feedback for this interview." })
    ] });
  }
  const {
    overallRating = 0,
    overallReasoning = "No overall reasoning was provided.",
    recommendation = "Not a Fit",
    metrics = [],
    strengths = [],
    areasForImprovement = []
  } = feedback;
  return /* @__PURE__ */ jsxs15("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs15("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-950/50 p-4 rounded-lg", children: [
      /* @__PURE__ */ jsxs15("div", { className: "flex flex-col items-center justify-center text-center md:col-span-1", children: [
        /* @__PURE__ */ jsx17("h4", { className: "text-lg font-semibold text-slate-200 mb-2", children: "Overall Score" }),
        /* @__PURE__ */ jsx17(RatingCircle, { rating: overallRating }),
        /* @__PURE__ */ jsxs15("p", { className: "text-sm text-slate-400 mt-2 italic", children: [
          '"',
          overallReasoning,
          '"'
        ] })
      ] }),
      /* @__PURE__ */ jsxs15("div", { className: "md:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsx17(RecommendationBadge, { recommendation }),
        /* @__PURE__ */ jsx17("div", { className: "space-y-3", children: metrics.map((metric, i) => /* @__PURE__ */ jsx17(MetricBar, { metric }, metric.name || i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs15("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs15("div", { className: "bg-slate-950/50 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsx17("div", { className: "text-green-400", children: /* @__PURE__ */ jsx17(ThumbsUpIcon, {}) }),
          /* @__PURE__ */ jsx17("h4", { className: "text-lg font-semibold text-slate-200", children: "Strengths" })
        ] }),
        /* @__PURE__ */ jsx17("ul", { className: "space-y-2", children: strengths.length > 0 ? strengths.map((strength, i) => /* @__PURE__ */ jsxs15("li", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsx17("div", { className: "text-green-500 pt-1 flex-shrink-0", children: /* @__PURE__ */ jsx17(SimpleCheckIcon, {}) }),
          /* @__PURE__ */ jsx17("span", { className: "text-slate-300 text-sm", children: strength })
        ] }, i)) : /* @__PURE__ */ jsx17("li", { className: "text-slate-400 text-sm", children: "No specific strengths were identified." }) })
      ] }),
      /* @__PURE__ */ jsxs15("div", { className: "bg-slate-950/50 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsx17("div", { className: "text-yellow-400", children: /* @__PURE__ */ jsx17(LightbulbIcon, {}) }),
          /* @__PURE__ */ jsx17("h4", { className: "text-lg font-semibold text-slate-200", children: "Areas for Improvement" })
        ] }),
        /* @__PURE__ */ jsx17("ul", { className: "space-y-2", children: areasForImprovement.length > 0 ? areasForImprovement.map((area, i) => /* @__PURE__ */ jsxs15("li", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsx17("div", { className: "text-yellow-500 pt-1 flex-shrink-0", children: /* @__PURE__ */ jsx17(LightbulbIcon, {}) }),
          /* @__PURE__ */ jsx17("span", { className: "text-slate-300 text-sm", children: area })
        ] }, i)) : /* @__PURE__ */ jsx17("li", { className: "text-slate-400 text-sm", children: "No specific areas for improvement were identified." }) })
      ] })
    ] })
  ] });
};
var FeedbackPanel_default = FeedbackPanel;

// components/MalpracticeReportPanel.tsx
import { jsx as jsx18, jsxs as jsxs16 } from "react/jsx-runtime";
var MalpracticeReportPanel = ({ report }) => {
  if (!report) {
    return /* @__PURE__ */ jsxs16("div", { className: "bg-green-500/10 p-4 rounded-lg border border-green-500/20", children: [
      /* @__PURE__ */ jsx18("h3", { className: "text-lg font-semibold text-green-300", children: "Malpractice Report" }),
      /* @__PURE__ */ jsx18("p", { className: "text-green-300/80 mt-2 text-sm", children: "No malpractice activities were detected during the interview." })
    ] });
  }
  const reportEntries = report.split("\n").filter((line) => line.trim() !== "");
  return /* @__PURE__ */ jsxs16("div", { className: "bg-red-900/20 p-4 rounded-lg border border-red-500/30", children: [
    /* @__PURE__ */ jsxs16("div", { className: "flex items-center gap-3 mb-3", children: [
      /* @__PURE__ */ jsx18("div", { className: "text-red-400", children: /* @__PURE__ */ jsx18(AlertTriangleIcon, {}) }),
      /* @__PURE__ */ jsx18("h3", { className: "text-lg font-semibold text-red-300", children: "Malpractice Report" })
    ] }),
    /* @__PURE__ */ jsx18("div", { className: "space-y-3 text-sm", children: reportEntries.map((entry, index) => /* @__PURE__ */ jsx18("div", { className: "p-3 bg-slate-950/50 rounded-md border border-slate-700/50", children: /* @__PURE__ */ jsx18("p", { className: "text-slate-300", children: entry }) }, index)) }),
    /* @__PURE__ */ jsx18("p", { className: "text-xs text-red-400/70 mt-4 italic", children: "Note: This report is generated based on automated detection and should be considered alongside the full interview context." })
  ] });
};
var MalpracticeReportPanel_default = MalpracticeReportPanel;

// components/PlaybackScreen.tsx
import { jsx as jsx19, jsxs as jsxs17 } from "react/jsx-runtime";
var TabButton = ({ title, active, onClick }) => /* @__PURE__ */ jsx19(
  "button",
  {
    onClick,
    className: `flex-1 p-3 font-semibold transition-colors ${active ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-700/50"}`,
    children: title
  }
);
var PlaybackScreen = ({ interviewId, mediaBlob, fullTranscript, malpracticeReport, qna, mode, settings, onFinishReview, modelSettings: modelSettings2 }) => {
  const [activeTab, setActiveTab] = useState17("report");
  const [feedback, setFeedback] = useState17(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState17(false);
  const [feedbackError, setFeedbackError] = useState17("");
  const [loadingMessage, setLoadingMessage] = useState17("Generating AI feedback...");
  const [mediaUrl, setMediaUrl] = useState17(null);
  const isVideo = mode === InterviewMode.VIDEO || mode === InterviewMode.LIVE_SHARE;
  const isChat = mode === InterviewMode.CHAT;
  const hasMedia = !!mediaBlob && !isChat;
  const hasTranscript = !!fullTranscript;
  useEffect16(() => {
    if (mediaBlob) {
      const url = URL.createObjectURL(mediaBlob);
      setMediaUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [mediaBlob]);
  const handleDownload = () => {
    if (mediaUrl) {
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = mediaUrl;
      a.download = `interview-recording-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  async function withRetries(apiCall, retries = 3, delay = 3e4) {
    try {
      setLoadingMessage("Analyzing performance and preparing suggestions...");
      return await apiCall();
    } catch (error) {
      const { type, message } = getApiErrorDetails2(error);
      if (type === "RATE_LIMIT" && retries > 0) {
        const waitTime = delay / 1e3;
        console.log(`Rate limit hit during feedback generation. Retrying in ${waitTime}s...`);
        setLoadingMessage(`Rate limit reached. Retrying in ${waitTime} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return withRetries(apiCall, retries - 1, delay * 2);
      }
      throw new Error(message);
    }
  }
  useEffect16(() => {
    const getFeedback = async () => {
      setIsFeedbackLoading(true);
      setFeedbackError("");
      setFeedback(null);
      try {
        if (!qna || qna.length === 0) {
          throw new Error("No questions were recorded for this interview.");
        }
        const mockQuestions = qna.map((pair, index) => ({
          id: `q-mock-${index}`,
          interview_id: interviewId,
          question_text: pair.question,
          asked_at: (/* @__PURE__ */ new Date()).toISOString(),
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }));
        const mockAnswers = qna.map((pair, index) => ({
          id: `a-mock-${index}`,
          question_id: `q-mock-${index}`,
          // Link to the mock question
          answer_text: pair.answer,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }));
        const apiCall = () => generateFeedback({
          model: modelSettings2.evaluation,
          questions: mockQuestions,
          answers: mockAnswers,
          settings,
          malpracticeReport
        });
        const feedbackData = await withRetries(apiCall);
        setFeedback(feedbackData);
      } catch (e) {
        console.error("Error generating feedback after retries:", e);
        const errorMessage = getApiErrorDetails2(e).message;
        setFeedbackError(errorMessage);
      } finally {
        setIsFeedbackLoading(false);
      }
    };
    getFeedback();
  }, [interviewId, settings, modelSettings2.evaluation, malpracticeReport, qna]);
  const layoutClasses = hasMedia && hasTranscript ? "grid-cols-1 lg:grid-cols-2 gap-6" : "grid-cols-1";
  return /* @__PURE__ */ jsx19("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-8", children: /* @__PURE__ */ jsxs17("div", { className: "w-full max-w-5xl", children: [
    /* @__PURE__ */ jsx19("h1", { className: "text-3xl font-bold text-center mb-6", children: "Interview Review" }),
    /* @__PURE__ */ jsxs17("div", { className: `bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-2xl grid ${layoutClasses}`, children: [
      hasMedia && mediaUrl && /* @__PURE__ */ jsxs17("div", { className: "w-full", children: [
        /* @__PURE__ */ jsxs17("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx19("h2", { className: "text-xl font-semibold text-slate-200", children: isVideo ? "Video Recording" : "Audio Recording" }),
          /* @__PURE__ */ jsxs17("button", { onClick: handleDownload, className: "flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors", children: [
            /* @__PURE__ */ jsx19("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx19("path", { fillRule: "evenodd", d: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z", clipRule: "evenodd" }) }),
            "Download"
          ] })
        ] }),
        isVideo ? /* @__PURE__ */ jsx19("video", { src: mediaUrl, controls: true, autoPlay: true, className: "w-full rounded-lg" }) : /* @__PURE__ */ jsx19("audio", { src: mediaUrl, controls: true, autoPlay: true, className: "w-full" })
      ] }),
      hasTranscript && /* @__PURE__ */ jsxs17("div", { className: "w-full flex flex-col", children: [
        /* @__PURE__ */ jsxs17("div", { className: "flex border-b border-slate-700 flex-shrink-0", children: [
          /* @__PURE__ */ jsx19(TabButton, { title: "Full Report", active: activeTab === "report", onClick: () => setActiveTab("report") }),
          /* @__PURE__ */ jsx19(TabButton, { title: "Transcript", active: activeTab === "transcript", onClick: () => setActiveTab("transcript") })
        ] }),
        /* @__PURE__ */ jsxs17("div", { className: "flex-1 overflow-y-auto bg-slate-900 p-4 rounded-b-md border border-t-0 border-slate-700 min-h-[200px] max-h-[70vh]", children: [
          activeTab === "transcript" && /* @__PURE__ */ jsxs17("div", { children: [
            /* @__PURE__ */ jsx19("h2", { className: "text-xl font-semibold mb-4 text-slate-200", children: "Interview Transcript" }),
            /* @__PURE__ */ jsx19("pre", { className: "text-slate-300 whitespace-pre-wrap font-sans text-sm", children: fullTranscript })
          ] }),
          activeTab === "report" && /* @__PURE__ */ jsxs17("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx19(MalpracticeReportPanel_default, { report: malpracticeReport }),
            /* @__PURE__ */ jsx19(
              FeedbackPanel_default,
              {
                feedback,
                isLoading: isFeedbackLoading,
                error: feedbackError,
                loadingMessage
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx19("div", { className: "text-center mt-8", children: /* @__PURE__ */ jsx19(
      "button",
      {
        onClick: () => onFinishReview(interviewId, feedback, mediaBlob, fullTranscript, malpracticeReport),
        className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors",
        children: "Finish Review & Save to History"
      }
    ) })
  ] }) });
};
var PlaybackScreen_default = PlaybackScreen;

// components/HistoryScreen.tsx
import { useState as useState18, useEffect as useEffect17, useMemo as useMemo6 } from "react";
import { Fragment as Fragment9, jsx as jsx20, jsxs as jsxs18 } from "react/jsx-runtime";
var CommentsPanel = ({ interviewId, currentUser }) => {
  const [comments, setComments] = useState18([]);
  const [newComment, setNewComment] = useState18("");
  const [isLoading, setIsLoading] = useState18(false);
  useEffect17(() => {
    const fetchComments = async () => {
      const fetchedComments = await getCommentsForInterview(interviewId);
      setComments(fetchedComments);
    };
    fetchComments();
  }, [interviewId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim())
      return;
    setIsLoading(true);
    const addedComment = await addComment({
      interview_id: interviewId,
      user_id: currentUser.id,
      comment_text: newComment,
      is_internal: false
      // Default to non-internal
    });
    if (addedComment) {
      const displayComment = { ...addedComment, users: { name: currentUser.name } };
      setComments((prev) => [...prev, displayComment]);
      setNewComment("");
    }
    setIsLoading(false);
  };
  return /* @__PURE__ */ jsxs18("div", { className: "bg-slate-950/50 p-4 rounded-lg", children: [
    /* @__PURE__ */ jsx20("h3", { className: "text-lg font-semibold text-slate-200 mb-4", children: "Team Comments" }),
    /* @__PURE__ */ jsx20("div", { className: "space-y-4 max-h-60 overflow-y-auto pr-2", children: comments.length > 0 ? comments.map((comment) => /* @__PURE__ */ jsxs18("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx20("div", { className: "bg-slate-700 rounded-full p-2 mt-1", children: /* @__PURE__ */ jsx20(UserCircleIcon, { className: "h-5 w-5 text-slate-400" }) }),
      /* @__PURE__ */ jsxs18("div", { children: [
        /* @__PURE__ */ jsxs18("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx20("span", { className: "font-semibold text-slate-300", children: comment.users?.name || "User" }),
          /* @__PURE__ */ jsx20("span", { className: "text-xs text-slate-500", children: new Date(comment.created_at).toLocaleString() })
        ] }),
        /* @__PURE__ */ jsx20("p", { className: "text-slate-300 text-sm", children: comment.comment_text })
      ] })
    ] }, comment.id)) : /* @__PURE__ */ jsx20("p", { className: "text-sm text-slate-400", children: "No comments yet." }) }),
    /* @__PURE__ */ jsxs18("form", { onSubmit: handleSubmit, className: "mt-4 flex gap-2 items-start", children: [
      /* @__PURE__ */ jsx20(
        "textarea",
        {
          value: newComment,
          onChange: (e) => setNewComment(e.target.value),
          placeholder: "Add a comment...",
          rows: 2,
          className: "flex-1 bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled: isLoading
        }
      ),
      /* @__PURE__ */ jsx20("button", { type: "submit", disabled: isLoading || !newComment.trim(), className: "p-3 bg-blue-600 hover:bg-blue-500 rounded-md disabled:opacity-50", children: /* @__PURE__ */ jsx20(SendIcon, {}) })
    ] })
  ] });
};
var transformReportToFeedbackData = (report) => {
  if (!report)
    return null;
  const metrics = [];
  if (report.technical_score)
    metrics.push({ name: "Technical Score", rating: report.technical_score, reasoning: "Based on interview performance." });
  if (report.communication_score)
    metrics.push({ name: "Communication Score", rating: report.communication_score, reasoning: "Based on interview performance." });
  if (report.problem_solving_score)
    metrics.push({ name: "Problem-Solving Score", rating: report.problem_solving_score, reasoning: "Based on interview performance." });
  const feedbackParts = report.feedback?.split("\n\n");
  const overallReasoning = feedbackParts?.find((p) => p.startsWith("Overall Reasoning:"))?.replace("Overall Reasoning: ", "");
  const strengthsText = feedbackParts?.find((p) => p.startsWith("Strengths:"))?.replace("Strengths:\n", "");
  const strengths = strengthsText ? strengthsText.split("\n- ").filter((s) => s) : [];
  const improvementText = feedbackParts?.find((p) => p.startsWith("Areas for Improvement:"))?.replace("Areas for Improvement:\n", "");
  const areasForImprovement = improvementText ? improvementText.split("\n- ").filter((a) => a) : [];
  return {
    overallRating: report.overall_score,
    recommendation: report.recommendation,
    metrics,
    overallReasoning,
    strengths,
    areasForImprovement
  };
};
var DetailView = ({ item, currentUser, onBack }) => {
  const [report, setReport] = useState18(null);
  const [isLoadingReport, setIsLoadingReport] = useState18(true);
  const [reconstructedTranscript, setReconstructedTranscript] = useState18(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState18(true);
  const { showToast } = useToast();
  const feedbackDataForPanel = useMemo6(() => transformReportToFeedbackData(report), [report]);
  useEffect17(() => {
    const fetchReport = async () => {
      setIsLoadingReport(true);
      const fetchedReport = await getReportForInterview(item.id);
      setReport(fetchedReport);
      setIsLoadingReport(false);
    };
    fetchReport();
  }, [item.id]);
  useEffect17(() => {
    const fetchAndBuildTranscript = async () => {
      try {
        setIsLoadingTranscript(true);
        const questions = await getQuestionsForInterview(item.id);
        if (questions && questions.length > 0) {
          const answers = await getAnswersForInterview(questions.map((q) => q.id));
          const transcript = questions.sort((a, b) => new Date(a.asked_at || a.created_at).getTime() - new Date(b.asked_at || b.created_at).getTime()).map((q) => {
            const answer = answers.find((a) => a.question_id === q.id);
            return `Interviewer: ${q.question_text}

Candidate: ${answer?.answer_text || "(No answer recorded)"}`;
          }).join("\n\n---\n\n");
          setReconstructedTranscript(transcript);
        } else {
          setReconstructedTranscript("No questions and answers were saved for this interview.");
        }
      } catch (error) {
        console.error("Error fetching transcript data:", error);
        setReconstructedTranscript("Could not load transcript.");
      } finally {
        setIsLoadingTranscript(false);
      }
    };
    fetchAndBuildTranscript();
  }, [item.id]);
  const handleCopyTranscript = () => {
    if (reconstructedTranscript) {
      navigator.clipboard.writeText(reconstructedTranscript).then(() => {
        showToast("Transcript copied to clipboard!", "success");
      });
    }
  };
  return /* @__PURE__ */ jsxs18("div", { className: "animate-fade-in", children: [
    /* @__PURE__ */ jsx20("button", { onClick: onBack, className: "text-slate-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-6 inline-flex items-center gap-2", children: "\u2190 Back to History" }),
    /* @__PURE__ */ jsxs18("div", { className: "bg-slate-800/80 p-6 rounded-lg border border-slate-700 space-y-6", children: [
      /* @__PURE__ */ jsxs18("div", { children: [
        /* @__PURE__ */ jsx20("h2", { className: "text-2xl font-bold text-slate-100", children: item.position }),
        /* @__PURE__ */ jsxs18("p", { className: "text-slate-400", children: [
          "Interview conducted on ",
          new Date(item.created_at).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsx20("hr", { className: "border-slate-700" }),
      /* @__PURE__ */ jsxs18("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx20(MalpracticeReportPanel_default, { report: item.malpractice_report || null }),
        /* @__PURE__ */ jsx20(
          FeedbackPanel_default,
          {
            feedback: feedbackDataForPanel,
            isLoading: isLoadingReport,
            error: !isLoadingReport && !report ? "Could not load feedback report." : "",
            loadingMessage: "Loading feedback..."
          }
        ),
        /* @__PURE__ */ jsx20(CommentsPanel, { interviewId: item.id, currentUser }),
        /* @__PURE__ */ jsxs18("div", { className: "bg-slate-950/50 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxs18("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx20("h3", { className: "text-lg font-semibold text-slate-200", children: "Transcript" }),
            !isLoadingTranscript && reconstructedTranscript && /* @__PURE__ */ jsxs18("button", { onClick: handleCopyTranscript, className: "flex items-center gap-2 text-sm text-slate-400 hover:text-white", children: [
              /* @__PURE__ */ jsx20(DocumentDuplicateIcon, {}),
              " Copy"
            ] })
          ] }),
          /* @__PURE__ */ jsx20("div", { className: "text-slate-300 whitespace-pre-wrap font-sans text-sm max-h-60 overflow-y-auto bg-slate-900 p-3 rounded-md", children: isLoadingTranscript ? /* @__PURE__ */ jsx20("p", { children: "Loading transcript..." }) : /* @__PURE__ */ jsx20("pre", { children: reconstructedTranscript }) })
        ] })
      ] })
    ] })
  ] });
};
var HistoryCard = ({ item, onViewReport, onDownload, isDownloading }) => {
  const { mode, difficulty, position, created_at, video_url } = item;
  const icon = useMemo6(() => {
    switch (mode) {
      case InterviewMode.VIDEO:
        return /* @__PURE__ */ jsx20(VideoCameraIcon, {});
      case InterviewMode.AUDIO:
        return /* @__PURE__ */ jsx20(MicOnIcon, {});
      case InterviewMode.CHAT:
        return /* @__PURE__ */ jsx20(ChatBubbleIcon, {});
      case InterviewMode.LIVE_SHARE:
        return /* @__PURE__ */ jsx20(ShareIcon, {});
      default:
        return null;
    }
  }, [mode]);
  const formattedDate = new Date(created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return /* @__PURE__ */ jsxs18("div", { className: "bg-slate-800/80 p-5 rounded-lg border border-slate-700 hover:border-blue-500 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxs18("div", { className: "flex items-start gap-4 flex-1", children: [
      /* @__PURE__ */ jsx20("div", { className: "text-blue-400 mt-1", children: icon }),
      /* @__PURE__ */ jsxs18("div", { children: [
        /* @__PURE__ */ jsx20("h3", { className: "font-bold text-lg text-slate-100", children: position }),
        /* @__PURE__ */ jsxs18("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mt-1", children: [
          /* @__PURE__ */ jsx20("span", { children: mode }),
          /* @__PURE__ */ jsx20("span", { className: "hidden sm:inline", children: "\u2022" }),
          /* @__PURE__ */ jsxs18("span", { children: [
            difficulty,
            " Difficulty"
          ] }),
          /* @__PURE__ */ jsx20("span", { className: "hidden sm:inline", children: "\u2022" }),
          /* @__PURE__ */ jsx20("span", { children: formattedDate })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs18("div", { className: "w-full sm:w-auto flex-shrink-0 mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-2", children: [
      video_url && /* @__PURE__ */ jsx20(
        "button",
        {
          onClick: () => onDownload(video_url, position),
          disabled: isDownloading,
          className: "w-full sm:w-auto text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-wait",
          children: isDownloading ? /* @__PURE__ */ jsxs18(Fragment9, { children: [
            /* @__PURE__ */ jsx20("div", { className: "w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" }),
            "Downloading..."
          ] }) : "Download Recording"
        }
      ),
      /* @__PURE__ */ jsx20(
        "button",
        {
          onClick: () => onViewReport(item),
          className: "w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors",
          children: "View Report"
        }
      )
    ] })
  ] });
};
var HistoryScreen = ({ currentUser, onBackToHome }) => {
  const [history, setHistory] = useState18([]);
  const [isLoading, setIsLoading] = useState18(true);
  const [selectedInterview, setSelectedInterview] = useState18(null);
  const [downloadingId, setDownloadingId] = useState18(null);
  const { showToast } = useToast();
  useEffect17(() => {
    const fetchHistory = async () => {
      if (currentUser) {
        setIsLoading(true);
        const userHistory = await getInterviewsForUser(currentUser.id);
        setHistory(userHistory);
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);
  const handleDownloadFromHistory = async (mediaPath, position) => {
    setDownloadingId(mediaPath);
    try {
      const url = await getRecordingDownloadUrl(mediaPath);
      if (url) {
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `interview-recording-${position.replace(/ /g, "_")}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        showToast("Could not get download link for the recording.", "error");
      }
    } catch (error) {
      console.error("Error downloading from history:", error);
      showToast("Failed to download recording.", "error");
    } finally {
      setDownloadingId(null);
    }
  };
  const renderContent = () => {
    if (!currentUser) {
      return /* @__PURE__ */ jsx20("div", { className: "text-center p-10", children: /* @__PURE__ */ jsx20("p", { children: "Please log in to view your history." }) });
    }
    if (selectedInterview) {
      return /* @__PURE__ */ jsx20(DetailView, { item: selectedInterview, currentUser, onBack: () => setSelectedInterview(null) });
    }
    return /* @__PURE__ */ jsxs18(Fragment9, { children: [
      /* @__PURE__ */ jsxs18("div", { className: "text-center mb-10", children: [
        /* @__PURE__ */ jsx20("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Interview History" }),
        /* @__PURE__ */ jsx20("p", { className: "text-slate-400 mt-4 text-lg", children: "Review your past interview sessions and track your progress." })
      ] }),
      isLoading ? /* @__PURE__ */ jsx20("div", { className: "flex justify-center items-center h-48", children: /* @__PURE__ */ jsx20("div", { className: "w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin" }) }) : history.length > 0 ? /* @__PURE__ */ jsx20("div", { className: "space-y-4", children: history.map((item) => /* @__PURE__ */ jsx20(
        HistoryCard,
        {
          item,
          onViewReport: setSelectedInterview,
          onDownload: handleDownloadFromHistory,
          isDownloading: downloadingId === item.video_url
        },
        item.id
      )) }) : /* @__PURE__ */ jsxs18("div", { className: "text-center bg-slate-800/50 p-10 rounded-lg border border-slate-700", children: [
        /* @__PURE__ */ jsx20("h2", { className: "text-xl font-semibold text-slate-200", children: "No History Found" }),
        /* @__PURE__ */ jsx20("p", { className: "text-slate-400 mt-2", children: "You haven't completed any interviews yet. Go to the main page to start one!" })
      ] }),
      /* @__PURE__ */ jsx20("div", { className: "text-center mt-12", children: /* @__PURE__ */ jsx20(
        "button",
        {
          onClick: onBackToHome,
          className: "text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors",
          children: "\u2190 Back to Home"
        }
      ) })
    ] });
  };
  return /* @__PURE__ */ jsx20("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12", children: /* @__PURE__ */ jsx20("div", { className: "w-full max-w-4xl mx-auto", children: renderContent() }) });
};
var HistoryScreen_default = HistoryScreen;

// components/Card.tsx
import { jsx as jsx21, jsxs as jsxs19 } from "react/jsx-runtime";
var Card = ({ title, icon, children, className }) => {
  return /* @__PURE__ */ jsxs19("div", { className: `bg-slate-800 p-6 rounded-lg border border-slate-700 ${className}`, children: [
    /* @__PURE__ */ jsxs19("div", { className: "flex items-center gap-3 mb-4", children: [
      /* @__PURE__ */ jsx21("div", { className: "text-blue-400", children: icon }),
      /* @__PURE__ */ jsx21("h2", { className: "text-lg font-semibold text-slate-200", children: title })
    ] }),
    /* @__PURE__ */ jsx21("div", { children })
  ] });
};
var Card_default = Card;

// components/CommunityScreen.tsx
import { jsx as jsx22, jsxs as jsxs20 } from "react/jsx-runtime";
var tableData = [
  { tool: "Interviewing.io", features: "Live coding with engineers from top tech companies." },
  { tool: "Pramp", features: "Peer-to-peer mock sessions with structured feedback." },
  { tool: "LeetCode", features: "Extensive library of coding challenges and mock assessments." },
  { tool: "HackerRank", features: "Tailored mock interviews for various tech roles." },
  { tool: "CodeSignal", features: "Skill assessment and benchmarking against industry standards." },
  { tool: "Gainlo", features: "Connects applicants with experienced mock interviewers." }
];
var BenefitCard = ({ videoSrc, title, children }) => /* @__PURE__ */ jsxs20("div", { className: "relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden group hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 h-80", children: [
  /* @__PURE__ */ jsx22(
    "video",
    {
      src: videoSrc,
      autoPlay: true,
      loop: true,
      muted: true,
      playsInline: true,
      className: "absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
    },
    videoSrc
  ),
  /* @__PURE__ */ jsx22("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" }),
  /* @__PURE__ */ jsxs20("div", { className: "relative h-full flex flex-col justify-end p-6", children: [
    /* @__PURE__ */ jsx22("h3", { className: "text-xl font-bold text-white mb-2 transition-colors duration-300", children: title }),
    /* @__PURE__ */ jsx22("p", { className: "text-slate-300 text-sm leading-relaxed", children })
  ] })
] });
var CommunityScreen = ({ onBackToHome }) => {
  return /* @__PURE__ */ jsx22("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12 pb-20", children: /* @__PURE__ */ jsxs20("div", { className: "w-full max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs20("div", { className: "text-center mb-16", children: [
      /* @__PURE__ */ jsx22("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "AI: Redefining Hiring and Career Readiness" }),
      /* @__PURE__ */ jsx22("p", { className: "text-slate-400 mt-4 text-lg max-w-3xl mx-auto", children: "As AI integrates into hiring, understanding these tools is essential. Welcome to the intelligent hiring revolution\u2014faster, smarter, and more precise." })
    ] }),
    /* @__PURE__ */ jsxs20("section", { id: "why-ai", className: "mb-16", children: [
      /* @__PURE__ */ jsx22("h2", { className: "text-2xl font-bold text-slate-100 text-center mb-8", children: "Why AI in Recruitment?" }),
      /* @__PURE__ */ jsxs20("div", { className: "grid md:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsx22(BenefitCard, { title: "Enhanced Efficiency", videoSrc: COMMUNITY_EFFICIENCY_VIDEO, children: "AI automates scheduling and initial screenings, reducing time-to-hire from weeks to days and freeing up teams to focus on the best candidates." }),
        /* @__PURE__ */ jsx22(BenefitCard, { title: "Reduced Bias", videoSrc: COMMUNITY_BIAS_VIDEO, children: "By using standardized assessments, AI focuses on skills and qualifications, helping to minimize unconscious bias and promote fair evaluation." }),
        /* @__PURE__ */ jsx22(BenefitCard, { title: "In-Depth Analysis", videoSrc: COMMUNITY_ANALYSIS_VIDEO, children: "Gain objective insights into candidate performance, analyzing everything from speech clarity and confidence to technical proficiency." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs20("section", { id: "tools", className: "mb-16", children: [
      /* @__PURE__ */ jsx22("h2", { className: "text-2xl font-bold text-slate-100 text-center mb-8", children: "Top AI-Powered Tools for Interview Prep" }),
      /* @__PURE__ */ jsx22("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-6", children: tableData.map(({ tool, features }) => /* @__PURE__ */ jsxs20("div", { className: "bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 transition-all transform hover:-translate-y-1", children: [
        /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-slate-200", children: tool }),
        /* @__PURE__ */ jsx22("p", { className: "text-sm text-slate-400 mt-2", children: features })
      ] }, tool)) })
    ] }),
    /* @__PURE__ */ jsxs20("section", { id: "challenges", children: [
      /* @__PURE__ */ jsx22("h2", { className: "text-2xl font-bold text-slate-100 text-center mb-8", children: "Critical Challenges & Human Oversight" }),
      /* @__PURE__ */ jsxs20("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx22(Card_default, { title: "Algorithmic Bias and Discrimination", icon: /* @__PURE__ */ jsx22(AlertTriangleIcon, {}), children: /* @__PURE__ */ jsx22("p", { className: "text-slate-400", children: "AI trained on historical data can perpetuate societal biases. Regular audits, diverse datasets, and crucial human oversight are necessary to ensure fairness and mitigate legal risks." }) }),
        /* @__PURE__ */ jsx22(Card_default, { title: "Loss of the Human Element", icon: /* @__PURE__ */ jsx22(AlertTriangleIcon, {}), children: /* @__PURE__ */ jsx22("p", { className: "text-slate-400", children: "An impersonal process can harm the candidate experience. Human judgment remains vital for assessing cultural fit, complex skills, and making final hiring decisions." }) }),
        /* @__PURE__ */ jsx22(Card_default, { title: "Ethical Boundaries", icon: /* @__PURE__ */ jsx22(AlertTriangleIcon, {}), children: /* @__PURE__ */ jsx22("p", { className: "text-slate-400", children: "The potential for cheating in asynchronous tests and a lack of transparency in AI decisions raise ethical questions that require clear guidelines and accountability." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx22("div", { className: "text-center mt-16", children: /* @__PURE__ */ jsx22(
      Link,
      {
        to: "/",
        onClick: (e) => {
          e.preventDefault();
          onBackToHome();
        },
        className: "inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-6 rounded-lg border border-slate-600 transition-colors",
        children: "\u2190 Back to Home"
      }
    ) })
  ] }) });
};
var CommunityScreen_default = CommunityScreen;

// components/LearnScreen.tsx
import { jsx as jsx23, jsxs as jsxs21 } from "react/jsx-runtime";
var competencies = [
  {
    type: "Sales & Behavioral",
    skills: "Communication, Persuasion, Objection Handling, and Resilience. AI can analyze speech clarity, confidence, and tone."
  },
  {
    type: "Non-Technical/Soft Skills",
    skills: "Teamwork, conscientiousness, and adaptability are assessed using psychometric evaluations and real-world simulations."
  }
];
var techQuestions = [
  "\u201CHave you used AI tools like ChatGPT in your work?\u201D",
  "\u201CWhat are your thoughts on AI in your industry?\u201D",
  "\u201CTell me about a time you had to learn a new digital tool quickly.\u201D",
  "\u201CHow do you stay informed about new technology?\u201D"
];
var prepStrategies = [
  "Experiment Proactively: Use tools like ChatGPT for personal projects to build familiarity.",
  "Stay Informed: Read industry blogs and follow AI analysts on LinkedIn.",
  "Be Transparent: If you lack experience, express your dedication to learning.",
  "Focus on Soft Skills: Adaptability and problem-solving are highly valued."
];
var LearnScreen = ({ onBackToHome }) => {
  return /* @__PURE__ */ jsx23("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12", children: /* @__PURE__ */ jsxs21("div", { className: "w-full max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs21("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsx23("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Learn Center: Mastering the AI-Driven Career" }),
      /* @__PURE__ */ jsx23("p", { className: "text-slate-400 mt-4 text-lg max-w-3xl mx-auto", children: "Your guide to thriving in the modern job market. Here are the skills and strategies to succeed in AI-powered interviews." })
    ] }),
    /* @__PURE__ */ jsx23("section", { className: "mb-12", children: /* @__PURE__ */ jsx23(Card_default, { title: "AI Mock Interview Practice: The Modern Advantage", icon: /* @__PURE__ */ jsx23(BookOpenIcon, {}), children: /* @__PURE__ */ jsxs21("div", { className: "text-slate-400 space-y-3", children: [
      /* @__PURE__ */ jsx23("p", { children: "AI platforms provide an experience that is real-time, interactive, and adaptive, generating role-specific questions dynamically." }),
      /* @__PURE__ */ jsxs21("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
        /* @__PURE__ */ jsxs21("li", { children: [
          /* @__PURE__ */ jsx23("strong", { className: "text-slate-300", children: "Adaptive Learning:" }),
          " The system adjusts question complexity based on your skill level."
        ] }),
        /* @__PURE__ */ jsxs21("li", { children: [
          /* @__PURE__ */ jsx23("strong", { className: "text-slate-300", children: "Communication Analysis:" }),
          " Get feedback on your confidence, tone, fluency, and clarity."
        ] }),
        /* @__PURE__ */ jsxs21("li", { children: [
          /* @__PURE__ */ jsx23("strong", { className: "text-slate-300", children: "Performance Tracking:" }),
          " Receive step-by-step feedback to enhance your responses over time."
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs21("section", { className: "mb-12", children: [
      /* @__PURE__ */ jsx23("h2", { className: "text-2xl font-bold text-slate-100 text-center mb-8", children: "Key Competencies to Develop" }),
      /* @__PURE__ */ jsx23("div", { className: "grid md:grid-cols-2 gap-8", children: competencies.map((comp) => /* @__PURE__ */ jsx23(Card_default, { title: comp.type, icon: /* @__PURE__ */ jsx23(AcademicCapIcon, {}), children: /* @__PURE__ */ jsx23("p", { className: "text-slate-400", children: comp.skills }) }, comp.type)) })
    ] }),
    /* @__PURE__ */ jsx23("section", { className: "mb-12", children: /* @__PURE__ */ jsxs21(Card_default, { title: "Preparing for AI Questions in Non-Tech Roles", icon: /* @__PURE__ */ jsx23(LightbulbIcon, {}), children: [
      /* @__PURE__ */ jsx23("p", { className: "text-slate-400 mb-4", children: "Digital literacy is now a core expectation. Be ready to discuss your relationship with technology and AI." }),
      /* @__PURE__ */ jsxs21("div", { className: "grid md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs21("div", { children: [
          /* @__PURE__ */ jsx23("h4", { className: "font-semibold text-slate-200 mb-2", children: "Common Questions:" }),
          /* @__PURE__ */ jsx23("ul", { className: "list-disc list-inside space-y-1 text-slate-400 text-sm", children: techQuestions.map((q, i) => /* @__PURE__ */ jsx23("li", { children: q }, i)) })
        ] }),
        /* @__PURE__ */ jsxs21("div", { children: [
          /* @__PURE__ */ jsx23("h4", { className: "font-semibold text-slate-200 mb-2", children: "Preparation Strategies:" }),
          /* @__PURE__ */ jsx23("ul", { className: "list-disc list-inside space-y-1 text-slate-400 text-sm", children: prepStrategies.map((s, i) => /* @__PURE__ */ jsx23("li", { children: s }, i)) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx23("div", { className: "text-center mt-12", children: /* @__PURE__ */ jsx23(
      "button",
      {
        onClick: onBackToHome,
        className: "text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors",
        children: "\u2190 Back to Home"
      }
    ) })
  ] }) });
};
var LearnScreen_default = LearnScreen;

// components/FeaturesScreen.tsx
import { jsx as jsx24, jsxs as jsxs22 } from "react/jsx-runtime";
var FeaturesScreen = ({ onBackToHome }) => {
  return /* @__PURE__ */ jsx24("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12 pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black", children: /* @__PURE__ */ jsxs22("div", { className: "w-full max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs22("div", { className: "text-center mb-16", children: [
      /* @__PURE__ */ jsx24("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Our Features" }),
      /* @__PURE__ */ jsx24("p", { className: "text-slate-400 mt-4 text-lg max-w-3xl mx-auto", children: "Leverage cutting-edge AI to conduct comprehensive and insightful interviews for any role." })
    ] }),
    /* @__PURE__ */ jsxs22("div", { className: "space-y-16", children: [
      /* @__PURE__ */ jsx24(
        FeatureCard_default,
        {
          title: "Video Interview",
          icon: /* @__PURE__ */ jsx24(VideoCameraIcon, {}),
          media: /* @__PURE__ */ jsx24(MediaContainer_default, { children: /* @__PURE__ */ jsx24(ImageSlider_default, { images: HERO_IMAGES }) }),
          children: /* @__PURE__ */ jsx24("p", { children: "Engage with candidates in a realistic, face-to-face interview simulation powered by our advanced AI. Assess verbal and non-verbal cues for a complete picture." })
        }
      ),
      /* @__PURE__ */ jsx24("hr", { className: "my-16 border-slate-800" }),
      /* @__PURE__ */ jsx24(
        FeatureCard_default,
        {
          title: "Audio Interview",
          icon: /* @__PURE__ */ jsx24(MicOnIcon, {}),
          reverseLayout: true,
          media: /* @__PURE__ */ jsx24(MediaContainer_default, { children: /* @__PURE__ */ jsx24(AudioVisualizer_default, { isSpeaking: true }) }),
          children: /* @__PURE__ */ jsx24("p", { children: "Conduct voice-only interviews perfect for initial screenings or roles where verbal communication is key. Our AI provides real-time transcription and analysis." })
        }
      ),
      /* @__PURE__ */ jsx24("hr", { className: "my-16 border-slate-800" }),
      /* @__PURE__ */ jsx24(
        FeatureCard_default,
        {
          title: "Live Screen Sharing",
          icon: /* @__PURE__ */ jsx24(ShareIcon, {}),
          media: /* @__PURE__ */ jsx24(MediaContainer_default, { children: /* @__PURE__ */ jsx24(ImageSlider_default, { images: SCREEN_SHARE_IMAGES }) }),
          children: /* @__PURE__ */ jsx24("p", { children: "Evaluate technical skills in real-time. Candidates can share their screen to tackle coding challenges, demonstrate software proficiency, or walk through portfolios." })
        }
      ),
      /* @__PURE__ */ jsx24("hr", { className: "my-16 border-slate-800" }),
      /* @__PURE__ */ jsx24(
        FeatureCard_default,
        {
          title: "Chat Interview",
          icon: /* @__PURE__ */ jsx24(ChatBubbleIcon, {}),
          reverseLayout: true,
          media: /* @__PURE__ */ jsx24(MediaContainer_default, { children: /* @__PURE__ */ jsx24(ChatInterviewPlaceholder, {}) }),
          children: /* @__PURE__ */ jsx24("p", { children: "A text-based interview format ideal for assessing written communication skills and for candidates in environments where video/audio is not feasible." })
        }
      ),
      /* @__PURE__ */ jsx24("hr", { className: "my-16 border-slate-800" }),
      /* @__PURE__ */ jsx24(
        FeatureCard_default,
        {
          title: "Performance Tracking",
          icon: /* @__PURE__ */ jsx24(ChartBarIcon, {}),
          media: /* @__PURE__ */ jsx24(MediaContainer_default, { children: /* @__PURE__ */ jsx24(ImageSlider_default, { images: PERFORMANCE_TRACKING_IMAGES }) }),
          children: /* @__PURE__ */ jsx24("p", { children: "Receive detailed, AI-generated reports after each interview. Our analytics cover technical proficiency, communication skills, confidence levels, and more, with data-driven insights to help you make the best hiring decisions." })
        }
      )
    ] }),
    /* @__PURE__ */ jsx24("div", { className: "text-center mt-16", children: /* @__PURE__ */ jsx24(
      "button",
      {
        onClick: onBackToHome,
        className: "inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-6 rounded-lg border border-slate-600 transition-colors",
        children: "\u2190 Back to Home"
      }
    ) })
  ] }) });
};
var FeaturesScreen_default = FeaturesScreen;

// components/PricingScreen.tsx
import { jsx as jsx25, jsxs as jsxs23 } from "react/jsx-runtime";
var PricingCard = ({ plan, onSelect, isCurrentPlan }) => {
  const highlightConfig = {
    blue: { border: "border-blue-500", badge: "bg-blue-600" },
    green: { border: "border-green-500", badge: "bg-green-600" }
  };
  const borderColor = plan.highlight ? highlightConfig[plan.highlight.color].border : "border-slate-700";
  const badgeBg = plan.highlight ? highlightConfig[plan.highlight.color].badge : "";
  return /* @__PURE__ */ jsxs23("div", { className: `bg-slate-800 p-8 rounded-lg border-2 flex flex-col h-full ${borderColor}`, children: [
    plan.highlight && /* @__PURE__ */ jsx25("div", { className: `absolute -top-3 left-1/2 -translate-x-1/2 ${badgeBg} text-white px-4 py-1 rounded-full text-sm font-semibold`, children: plan.highlight.text }),
    /* @__PURE__ */ jsx25("h3", { className: "text-2xl font-bold text-slate-100", children: plan.name }),
    /* @__PURE__ */ jsx25("p", { className: "text-slate-400 mt-2", children: plan.description }),
    /* @__PURE__ */ jsxs23("div", { className: "my-6", children: [
      /* @__PURE__ */ jsxs23("span", { className: "text-5xl font-bold text-white", children: [
        "\u20B9",
        plan.price
      ] }),
      /* @__PURE__ */ jsx25("span", { className: "text-slate-400", children: "/mo" })
    ] }),
    /* @__PURE__ */ jsx25("ul", { className: "space-y-3 text-slate-300 flex-grow", children: plan.features.map((feature, index) => /* @__PURE__ */ jsxs23("li", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx25("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-blue-400 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx25("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
      /* @__PURE__ */ jsx25("span", { children: feature })
    ] }, index)) }),
    /* @__PURE__ */ jsx25(
      "button",
      {
        onClick: () => onSelect(plan),
        disabled: isCurrentPlan,
        className: `w-full mt-8 font-bold py-3 px-4 rounded-lg transition-colors text-lg ${isCurrentPlan ? "bg-slate-700 cursor-not-allowed text-slate-400" : plan.ctaClass} disabled:opacity-50 disabled:cursor-not-allowed`,
        children: isCurrentPlan ? "Current Plan" : plan.cta
      }
    )
  ] });
};
var PricingScreen = ({ onBackToHome, onSelectPlan, currentUser }) => {
  return /* @__PURE__ */ jsx25("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12 pb-20", children: /* @__PURE__ */ jsxs23("div", { className: "w-full max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs23("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsx25("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Find the Right Plan for You" }),
      /* @__PURE__ */ jsx25("p", { className: "text-slate-400 mt-4 text-lg max-w-2xl mx-auto", children: "Choose the plan that fits your needs and unlock the full potential of AI-powered interviews." })
    ] }),
    /* @__PURE__ */ jsx25("div", { className: "grid md:grid-cols-3 gap-8 items-stretch", children: PLANS.map((plan) => /* @__PURE__ */ jsx25("div", { className: "relative", children: /* @__PURE__ */ jsx25(
      PricingCard,
      {
        plan,
        onSelect: onSelectPlan,
        isCurrentPlan: false
      }
    ) }, plan.name)) }),
    /* @__PURE__ */ jsx25("div", { className: "text-center mt-12", children: /* @__PURE__ */ jsx25(
      "button",
      {
        onClick: onBackToHome,
        className: "text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors",
        children: "\u2190 Back to Home"
      }
    ) })
  ] }) });
};
var PricingScreen_default = PricingScreen;

// components/CheckoutScreen.tsx
import * as React24 from "react";
import { jsx as jsx26, jsxs as jsxs24 } from "react/jsx-runtime";
var CheckoutForm = ({ plan, currentUser, onConfirmPurchase }) => {
  const [isProcessing, setIsProcessing] = React24.useState(false);
  const [name, setName] = React24.useState(currentUser?.name || "");
  const { showToast } = useToast();
  const handlePayment = () => {
    setIsProcessing(true);
    if (!window.Razorpay) {
      showToast("Payment gateway failed to load. Please check your network.", "error");
      setIsProcessing(false);
      return;
    }
    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag",
      // Public Razorpay Test Key
      amount: plan.price * 100,
      // Amount in paise
      currency: "INR",
      name: "AI Interview Platform",
      description: `Purchase - ${plan.name} Plan`,
      handler: (response) => {
        console.log("Razorpay Payment Success:", response);
        setIsProcessing(false);
        setTimeout(() => {
          onConfirmPurchase();
        }, 500);
      },
      modal: {
        ondismiss: () => {
          console.log("Checkout form closed");
          setIsProcessing(false);
        }
      },
      prefill: {
        name,
        email: currentUser?.email || ""
      },
      theme: {
        color: "#2563eb"
        // A blue color that matches the site
      }
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function(response) {
        console.error("Razorpay Payment Failed:", response);
        let errorMessage = "An unknown error occurred.";
        if (response && response.error) {
          if (response.error.description) {
            errorMessage = response.error.description;
          } else if (response.error.reason) {
            errorMessage = `Reason: ${response.error.reason.replace(/_/g, " ")}`;
          }
        }
        showToast(`Payment failed: ${errorMessage}`, "error");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Error initializing Razorpay:", err);
      showToast("Could not initialize payment gateway. Please try again.", "error");
      setIsProcessing(false);
    }
  };
  return /* @__PURE__ */ jsxs24("div", { className: "bg-slate-800 p-8 rounded-lg border border-slate-700", children: [
    /* @__PURE__ */ jsx26("h2", { className: "text-xl font-semibold mb-6", children: "Payment Details" }),
    /* @__PURE__ */ jsxs24("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs24("div", { children: [
        /* @__PURE__ */ jsx26("label", { htmlFor: "cardName", className: "block text-sm font-medium text-slate-300 mb-2", children: "Name" }),
        /* @__PURE__ */ jsxs24("div", { className: "relative", children: [
          /* @__PURE__ */ jsx26("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400", children: /* @__PURE__ */ jsx26(UserIcon, {}) }),
          /* @__PURE__ */ jsx26(
            "input",
            {
              type: "text",
              id: "cardName",
              className: "w-full bg-slate-700/50 border border-slate-600 rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "John Doe",
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx26("div", { children: /* @__PURE__ */ jsx26("p", { className: "text-sm text-slate-400", children: "You will be redirected to Razorpay's secure checkout page to enter your payment details." }) }),
      /* @__PURE__ */ jsx26("div", { className: "pt-2", children: /* @__PURE__ */ jsxs24("button", { onClick: handlePayment, disabled: isProcessing, className: "w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none", children: [
        isProcessing && /* @__PURE__ */ jsx26("div", { className: "w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" }),
        /* @__PURE__ */ jsx26(LockClosedIcon, {}),
        isProcessing ? "Processing..." : `Pay \u20B9${plan.price}`
      ] }) })
    ] })
  ] });
};
var CheckoutScreen = ({ plan: selectedPlan, currentUser, onConfirmPurchase, onBack }) => {
  if (!selectedPlan) {
    return /* @__PURE__ */ jsxs24("div", { className: "flex-1 flex flex-col items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx26("h2", { className: "text-2xl font-bold text-slate-100", children: "No Plan Selected" }),
      /* @__PURE__ */ jsx26("p", { className: "text-slate-400 mt-2", children: "Please go back to the pricing page to select a plan." }),
      /* @__PURE__ */ jsx26("button", { onClick: onBack, className: "mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]", children: "\u2190 Back to Pricing" })
    ] });
  }
  return /* @__PURE__ */ jsx26("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12", children: /* @__PURE__ */ jsxs24("div", { className: "w-full max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs24("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx26("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Secure Checkout" }),
      /* @__PURE__ */ jsxs24("p", { className: "text-slate-400 mt-4 text-lg", children: [
        "You're upgrading to the ",
        /* @__PURE__ */ jsx26("span", { className: "text-blue-400 font-semibold", children: selectedPlan.name }),
        " plan. Complete your payment below."
      ] })
    ] }),
    /* @__PURE__ */ jsxs24("div", { className: "grid lg:grid-cols-5 gap-8", children: [
      /* @__PURE__ */ jsx26("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsx26(CheckoutForm, { plan: selectedPlan, currentUser, onConfirmPurchase }) }),
      /* @__PURE__ */ jsx26("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs24("div", { className: "bg-slate-800 p-6 rounded-lg border border-slate-700 sticky top-24", children: [
        /* @__PURE__ */ jsx26("h2", { className: "text-xl font-semibold mb-4", children: "Order Summary" }),
        /* @__PURE__ */ jsxs24("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs24("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxs24("span", { className: "text-slate-400", children: [
              selectedPlan.name,
              " Plan"
            ] }),
            /* @__PURE__ */ jsxs24("span", { className: "font-semibold", children: [
              "\u20B9",
              selectedPlan.price
            ] })
          ] }),
          /* @__PURE__ */ jsxs24("div", { className: "flex justify-between text-slate-400", children: [
            /* @__PURE__ */ jsx26("span", { children: "Taxes & Fees" }),
            /* @__PURE__ */ jsx26("span", { className: "font-semibold", children: "\u20B90.00" })
          ] }),
          /* @__PURE__ */ jsx26("hr", { className: "border-slate-600 !my-4" }),
          /* @__PURE__ */ jsxs24("div", { className: "flex justify-between font-bold text-lg", children: [
            /* @__PURE__ */ jsx26("span", { children: "Total Due Today" }),
            /* @__PURE__ */ jsxs24("span", { children: [
              "\u20B9",
              selectedPlan.price
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx26("ul", { className: "mt-6 space-y-2 text-sm", children: selectedPlan.features.map((feature, index) => /* @__PURE__ */ jsxs24("li", { className: "flex items-center gap-2 text-slate-400", children: [
          /* @__PURE__ */ jsx26("div", { className: "w-5 h-5 text-blue-400", children: /* @__PURE__ */ jsx26(SimpleCheckIcon, {}) }),
          /* @__PURE__ */ jsx26("span", { children: feature })
        ] }, index)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx26("div", { className: "text-center mt-8", children: /* @__PURE__ */ jsx26("button", { onClick: onBack, className: "text-sm text-slate-400 hover:text-slate-200", children: "\u2190 Back to Pricing" }) })
  ] }) });
};
var CheckoutScreen_default = CheckoutScreen;

// components/OrderSuccessScreen.tsx
import { jsx as jsx27, jsxs as jsxs25 } from "react/jsx-runtime";
var OrderSuccessScreen = ({ onBackToHome }) => {
  return /* @__PURE__ */ jsx27("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-4", children: /* @__PURE__ */ jsxs25("div", { className: "bg-slate-800 p-10 rounded-lg border border-slate-700 max-w-lg w-full", children: [
    /* @__PURE__ */ jsx27("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx27("div", { className: "h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx27("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-green-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx27("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) }) }),
    /* @__PURE__ */ jsx27("h1", { className: "text-3xl font-bold text-slate-100", children: "Purchase Successful!" }),
    /* @__PURE__ */ jsx27("p", { className: "text-slate-400 mt-3 mb-8", children: "Your plan has been upgraded. You can now access all the features of your new plan." }),
    /* @__PURE__ */ jsx27(
      "button",
      {
        onClick: onBackToHome,
        className: "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]",
        children: "Go to Dashboard"
      }
    )
  ] }) });
};
var OrderSuccessScreen_default = OrderSuccessScreen;

// components/ContactScreen.tsx
import { useState as useState20 } from "react";
import { jsx as jsx28, jsxs as jsxs26 } from "react/jsx-runtime";
var ContactScreen = ({ onBackToHome }) => {
  const [formData, setFormData] = useState20({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState20({});
  const [isSubmitting, setIsSubmitting] = useState20(false);
  const [isSubmitted, setIsSubmitted] = useState20(false);
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formData.subject.trim())
      newErrors.subject = "Subject is required.";
    if (!formData.message.trim())
      newErrors.message = "Message is required.";
    return newErrors;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);
    }
  };
  const handleReset = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitted(false);
  };
  if (isSubmitted) {
    return /* @__PURE__ */ jsxs26("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-4", children: [
      /* @__PURE__ */ jsxs26("div", { className: "bg-slate-800 p-10 rounded-lg border border-slate-700 max-w-lg w-full", children: [
        /* @__PURE__ */ jsx28("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx28("div", { className: "h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx28("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-green-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx28("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) }) }),
        /* @__PURE__ */ jsx28("h1", { className: "text-3xl font-bold text-slate-100", children: "Thank You!" }),
        /* @__PURE__ */ jsx28("p", { className: "text-slate-400 mt-3 mb-8", children: "Your message has been sent successfully. Our team will get back to you shortly." }),
        /* @__PURE__ */ jsx28(
          "button",
          {
            onClick: handleReset,
            className: "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]",
            children: "Send Another Message"
          }
        )
      ] }),
      /* @__PURE__ */ jsx28("div", { className: "text-center mt-8", children: /* @__PURE__ */ jsx28(
        "button",
        {
          onClick: onBackToHome,
          className: "text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors",
          children: "\u2190 Back to Home"
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsx28("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12", children: /* @__PURE__ */ jsxs26("div", { className: "w-full max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxs26("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx28("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Contact Us" }),
      /* @__PURE__ */ jsx28("p", { className: "text-slate-400 mt-4 text-lg", children: "We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible." })
    ] }),
    /* @__PURE__ */ jsx28("div", { className: "bg-slate-800 p-8 rounded-lg border border-slate-700", children: /* @__PURE__ */ jsxs26("form", { onSubmit: handleSubmit, className: "space-y-6", noValidate: true, children: [
      /* @__PURE__ */ jsxs26("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs26("div", { children: [
          /* @__PURE__ */ jsx28("label", { htmlFor: "name", className: "block text-sm font-medium text-slate-300 mb-2", children: "Full Name" }),
          /* @__PURE__ */ jsxs26("div", { className: "relative", children: [
            /* @__PURE__ */ jsx28("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400", children: /* @__PURE__ */ jsx28(UserIcon, {}) }),
            /* @__PURE__ */ jsx28(
              "input",
              {
                type: "text",
                id: "name",
                value: formData.name,
                onChange: handleChange,
                className: `w-full bg-slate-700/50 border rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 ring-red-500" : "border-slate-600 focus:ring-blue-500 focus:border-blue-500"}`,
                placeholder: "Your Name"
              }
            )
          ] }),
          errors.name && /* @__PURE__ */ jsx28("p", { className: "mt-2 text-sm text-red-400", children: errors.name })
        ] }),
        /* @__PURE__ */ jsxs26("div", { children: [
          /* @__PURE__ */ jsx28("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }),
          /* @__PURE__ */ jsxs26("div", { className: "relative", children: [
            /* @__PURE__ */ jsx28("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400", children: /* @__PURE__ */ jsx28(AtSymbolIcon, {}) }),
            /* @__PURE__ */ jsx28(
              "input",
              {
                type: "email",
                id: "email",
                value: formData.email,
                onChange: handleChange,
                className: `w-full bg-slate-700/50 border rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 ring-red-500" : "border-slate-600 focus:ring-blue-500 focus:border-blue-500"}`,
                placeholder: "you@example.com"
              }
            )
          ] }),
          errors.email && /* @__PURE__ */ jsx28("p", { className: "mt-2 text-sm text-red-400", children: errors.email })
        ] })
      ] }),
      /* @__PURE__ */ jsxs26("div", { children: [
        /* @__PURE__ */ jsx28("label", { htmlFor: "subject", className: "block text-sm font-medium text-slate-300 mb-2", children: "Subject" }),
        /* @__PURE__ */ jsxs26("div", { className: "relative", children: [
          /* @__PURE__ */ jsx28("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400", children: /* @__PURE__ */ jsx28(PencilIcon, {}) }),
          /* @__PURE__ */ jsx28(
            "input",
            {
              type: "text",
              id: "subject",
              value: formData.subject,
              onChange: handleChange,
              className: `w-full bg-slate-700/50 border rounded-md py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.subject ? "border-red-500 ring-red-500" : "border-slate-600 focus:ring-blue-500 focus:border-blue-500"}`,
              placeholder: "How can we help?"
            }
          )
        ] }),
        errors.subject && /* @__PURE__ */ jsx28("p", { className: "mt-2 text-sm text-red-400", children: errors.subject })
      ] }),
      /* @__PURE__ */ jsxs26("div", { children: [
        /* @__PURE__ */ jsx28("label", { htmlFor: "message", className: "block text-sm font-medium text-slate-300 mb-2", children: "Message" }),
        /* @__PURE__ */ jsx28("div", { className: "relative", children: /* @__PURE__ */ jsx28(
          "textarea",
          {
            id: "message",
            value: formData.message,
            onChange: handleChange,
            rows: 5,
            className: `w-full bg-slate-700/50 border rounded-md py-2.5 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${errors.message ? "border-red-500 ring-red-500" : "border-slate-600 focus:ring-blue-500 focus:border-blue-500"}`,
            placeholder: "Your message..."
          }
        ) }),
        errors.message && /* @__PURE__ */ jsx28("p", { className: "mt-2 text-sm text-red-400", children: errors.message })
      ] }),
      /* @__PURE__ */ jsxs26(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none",
          children: [
            isSubmitting && /* @__PURE__ */ jsx28("div", { className: "w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" }),
            isSubmitting ? "Sending..." : "Send Message"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx28("div", { className: "text-center mt-8", children: /* @__PURE__ */ jsx28(
      "button",
      {
        onClick: onBackToHome,
        className: "text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors",
        children: "\u2190 Back to Home"
      }
    ) })
  ] }) });
};
var ContactScreen_default = ContactScreen;

// components/PrivacyScreen.tsx
import { jsx as jsx29, jsxs as jsxs27 } from "react/jsx-runtime";
var PrivacyScreen = ({ onBackToHome }) => {
  return /* @__PURE__ */ jsx29("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12", children: /* @__PURE__ */ jsxs27("div", { className: "w-full max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs27("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx29("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Privacy Policy" }),
      /* @__PURE__ */ jsx29("p", { className: "text-slate-400 mt-4 text-lg", children: "Last Updated: October 26, 2023" })
    ] }),
    /* @__PURE__ */ jsxs27("article", { className: "prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-200 prose-a:text-blue-400", children: [
      /* @__PURE__ */ jsx29("p", { children: "Your privacy is important to us. It is JD Labs' policy to respect your privacy regarding any information we may collect from you across our application, AI Interview Platform." }),
      /* @__PURE__ */ jsx29("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "1. Information We Collect" }),
      /* @__PURE__ */ jsx29("h3", { className: "text-xl font-semibold text-slate-200 mt-6 mb-3", children: "Personal Information" }),
      /* @__PURE__ */ jsx29("p", { children: "When you register for an account, we may ask for personal information, such as your name and email address." }),
      /* @__PURE__ */ jsx29("h3", { className: "text-xl font-semibold text-slate-200 mt-6 mb-3", children: "Interview Data" }),
      /* @__PURE__ */ jsx29("p", { children: "When you use our service to conduct an interview, we collect the data you provide, which may include:" }),
      /* @__PURE__ */ jsxs27("ul", { className: "list-disc list-inside space-y-2 mb-4 pl-4", children: [
        /* @__PURE__ */ jsx29("li", { children: "Video and audio recordings of your interview sessions." }),
        /* @__PURE__ */ jsx29("li", { children: "Transcripts of the interview conversation." }),
        /* @__PURE__ */ jsx29("li", { children: "Text responses you type in chat interviews." }),
        /* @__PURE__ */ jsx29("li", { children: "Job descriptions or URLs you provide for context." })
      ] }),
      /* @__PURE__ */ jsx29("h3", { className: "text-xl font-semibold text-slate-200 mt-6 mb-3", children: "API Keys" }),
      /* @__PURE__ */ jsx29("p", { children: "This application requires you to provide your own API key for third-party AI services (e.g., Google Gemini). We do not store your API key on our servers. The key is stored locally in your browser's memory for the duration of your session and is used to make direct calls to the AI provider's API from your browser." }),
      /* @__PURE__ */ jsx29("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "2. How We Use Your Information" }),
      /* @__PURE__ */ jsx29("p", { children: "We use the information we collect in various ways, including to:" }),
      /* @__PURE__ */ jsxs27("ul", { className: "list-disc list-inside space-y-2 mb-4 pl-4", children: [
        /* @__PURE__ */ jsx29("li", { children: "Provide, operate, and maintain our application." }),
        /* @__PURE__ */ jsx29("li", { children: "Process your interview data to generate AI-powered feedback and analysis." }),
        /* @__PURE__ */ jsx29("li", { children: "Improve, personalize, and expand our application." }),
        /* @__PURE__ */ jsx29("li", { children: "Communicate with you, either directly or through one of our partners, for customer service, to provide you with updates and other information relating to the app." })
      ] }),
      /* @__PURE__ */ jsx29("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "3. Data Sharing and Disclosure" }),
      /* @__PURE__ */ jsx29("p", { children: "Your interview data (transcripts, recordings) is sent to third-party AI providers (like Google) to generate questions and feedback. Their use of your data is governed by their respective privacy policies. We do not share your personal information with third parties for marketing purposes." }),
      /* @__PURE__ */ jsx29("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "4. Data Security" }),
      /* @__PURE__ */ jsx29("p", { children: "The security of your data is important to us. All interview recordings are processed locally in your browser and are not uploaded to our servers. The resulting media files (audio/video) and transcripts are stored temporarily in your browser's memory and are available for you to review and download. They are discarded when you finish the review or close the browser tab. Please be aware that no method of electronic storage is 100% secure." }),
      /* @__PURE__ */ jsx29("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "5. Children's Privacy" }),
      /* @__PURE__ */ jsx29("p", { children: "Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13." }),
      /* @__PURE__ */ jsx29("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "6. Changes to This Privacy Policy" }),
      /* @__PURE__ */ jsx29("p", { children: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes." }),
      /* @__PURE__ */ jsx29("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "7. Contact Us" }),
      /* @__PURE__ */ jsx29("p", { children: "If you have any questions about this Privacy Policy, please contact us through the Contact page." })
    ] }),
    /* @__PURE__ */ jsx29("div", { className: "text-center mt-12", children: /* @__PURE__ */ jsx29(
      "button",
      {
        onClick: onBackToHome,
        className: "text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors",
        children: "\u2190 Back to Home"
      }
    ) })
  ] }) });
};
var PrivacyScreen_default = PrivacyScreen;

// components/TermsScreen.tsx
import { jsx as jsx30, jsxs as jsxs28 } from "react/jsx-runtime";
var TermsScreen = ({ onBackToHome }) => {
  return /* @__PURE__ */ jsx30("div", { className: "flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12", children: /* @__PURE__ */ jsxs28("div", { className: "w-full max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs28("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx30("h1", { className: "text-3xl md:text-4xl font-bold text-slate-100", children: "Terms and Conditions" }),
      /* @__PURE__ */ jsx30("p", { className: "text-slate-400 mt-4 text-lg", children: "Last Updated: October 26, 2023" })
    ] }),
    /* @__PURE__ */ jsxs28("article", { className: "prose prose-invert prose-lg max-w-none text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-200 prose-a:text-blue-400", children: [
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "1. Acceptance of Terms" }),
      /* @__PURE__ */ jsx30("p", { children: 'By accessing and using the AI Interview Platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.' }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "2. Description of Service" }),
      /* @__PURE__ */ jsx30("p", { children: "The Service is an AI-powered platform that allows users to conduct mock interviews. The Service uses third-party generative AI models to ask questions and provide feedback based on user responses and provided job descriptions." }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "3. User Accounts" }),
      /* @__PURE__ */ jsx30("p", { children: "You may be required to register for an account to access certain features. You are responsible for safeguarding your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account." }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "4. User Conduct" }),
      /* @__PURE__ */ jsx30("p", { children: "You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You are solely responsible for the content you create, including video/audio recordings and transcripts." }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "5. API Key Usage" }),
      /* @__PURE__ */ jsx30("p", { children: "The Service requires you to provide your own API key from third-party AI providers (e.g., Google Gemini). You are responsible for any costs associated with the use of your API key. You acknowledge that providing your API key in a client-side application has security risks and agree to use this feature for development and testing purposes at your own risk. We are not liable for any unauthorized use or charges to your API key." }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "6. Intellectual Property" }),
      /* @__PURE__ */ jsx30("p", { children: "The Service and its original content, features, and functionality are and will remain the exclusive property of JD Labs and its licensors. You retain all rights to the content you create during your interviews. By using the Service, you grant us a limited license to process your content solely for the purpose of providing the Service's features to you." }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "7. Disclaimers" }),
      /* @__PURE__ */ jsx30("p", { children: 'The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The AI-generated feedback is for informational and educational purposes only and should not be considered professional career advice. We do not guarantee the accuracy, completeness, or usefulness of any information on the Service and neither adopt nor endorse, nor are we responsible for, the accuracy or reliability of any opinion, advice, or statement made.' }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "8. Limitation of Liability" }),
      /* @__PURE__ */ jsx30("p", { children: "In no event shall JD Labs, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service." }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "9. Changes to Terms" }),
      /* @__PURE__ */ jsx30("p", { children: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms and Conditions on this page." }),
      /* @__PURE__ */ jsx30("h2", { className: "text-2xl font-bold text-slate-100 mt-8 mb-4", children: "10. Contact Us" }),
      /* @__PURE__ */ jsx30("p", { children: "If you have any questions about these Terms, please contact us through our Contact page." })
    ] }),
    /* @__PURE__ */ jsx30("div", { className: "text-center mt-12", children: /* @__PURE__ */ jsx30(
      "button",
      {
        onClick: onBackToHome,
        className: "text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors",
        children: "\u2190 Back to Home"
      }
    ) })
  ] }) });
};
var TermsScreen_default = TermsScreen;

// App.tsx
import { jsx as jsx31, jsxs as jsxs29 } from "react/jsx-runtime";
var modelSettings = {
  chat: "gemini-2.5-flash",
  audio: "gemini-2.5-flash-native-audio-preview-09-2025",
  video: "gemini-2.5-flash-native-audio-preview-09-2025",
  liveShare: "gemini-2.5-flash-native-audio-preview-09-2025",
  evaluation: "gemini-2.5-pro",
  questionGeneration: "gemini-2.5-flash"
};
var App = () => {
  const [currentUser, setCurrentUser] = useState21(null);
  const [activeInterviewId, setActiveInterviewId] = useState21(null);
  const [interviewSettings, setInterviewSettings] = useState21(null);
  const [interviewResult, setInterviewResult] = useState21(null);
  const [selectedPlan, setSelectedPlan] = useState21(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  useEffect18(() => {
    console.log("\u{1F680} [App] Initializing authentication...");
    const checkSession = async () => {
      console.log("\u{1F50D} [App] Checking for existing session...");
      console.log("\u{1F50D} [App] LocalStorage keys:", Object.keys(localStorage).filter((k) => k.includes("supabase")));
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("\u2705 [App] Existing session found:", {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: session.expires_at
        });
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          console.log("\u2705 [App] Setting current user from existing session");
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.email
          });
        } else {
          console.warn("\u26A0\uFE0F [App] Profile not found for user, using email as name");
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email
          });
        }
      } else {
        console.log("\u2139\uFE0F [App] No existing session found - user is logged out");
      }
    };
    checkSession();
    console.log("\u{1F442} [App] Setting up auth state change listener...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("\u{1F514} [App] Auth state changed:", {
        event,
        userId: session?.user?.id,
        email: session?.user?.email,
        hasSession: !!session
      });
      if (session?.user) {
        console.log("\u{1F504} [App] User signed in, fetching profile...");
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          console.log("\u2705 [App] Setting current user after auth state change");
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.email
          });
        } else {
          console.warn("\u26A0\uFE0F [App] Profile not found for user, using email as name");
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email
          });
        }
      } else {
        console.log("\u{1F504} [App] User signed out, clearing current user");
        setCurrentUser(null);
      }
    });
    console.log("\u2705 [App] Auth listener setup complete");
    return () => {
      console.log("\u{1F6D1} [App] Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);
  const handleStartInterview = useCallback9(async (settings) => {
    if (!currentUser) {
      showToast("Please log in to start an interview.", "info");
      navigate("/login");
      return;
    }
    showToast("Initializing your interview...", "info");
    const interview = await createInterview(currentUser.id, settings);
    if (interview) {
      setInterviewSettings(settings);
      setActiveInterviewId(interview.id);
      navigate("/interview");
    } else {
      showToast("Could not start the interview. Please try again.", "error");
    }
  }, [currentUser, navigate, showToast]);
  const handleEndInterview = useCallback9((result) => {
    setInterviewResult(result);
    navigate("/review");
  }, [navigate]);
  const handleFinishReview = useCallback9(async (interviewId, feedback, mediaBlob, fullTranscript, malpracticeReport) => {
    if (!currentUser || !interviewResult)
      return;
    showToast("Saving your interview results...", "info");
    const { success, error } = await finalizeInterview({
      interviewId,
      userId: currentUser.id,
      transcript: fullTranscript,
      malpracticeReport,
      reportData: feedback,
      mediaBlob,
      qna: interviewResult.qna
    });
    if (success) {
      showToast("Interview saved successfully!", "success");
    } else {
      showToast(`Error saving interview: ${error}`, "error");
    }
    setActiveInterviewId(null);
    setInterviewSettings(null);
    setInterviewResult(null);
    navigate("/history");
  }, [currentUser, interviewResult, navigate, showToast]);
  const handleLogout = useCallback9(async () => {
    console.log("\u{1F6AA} [App.handleLogout] Starting logout...");
    console.log("\u{1F6AA} [App.handleLogout] Current user:", currentUser?.email);
    try {
      const userId = currentUser?.id;
      console.log("\u{1F6AA} [App.handleLogout] Calling signOut with userId:", userId);
      await signOut(userId);
      console.log("\u2705 [App.handleLogout] signOut completed successfully");
      console.log("\u{1F504} [App.handleLogout] Clearing currentUser state");
      setCurrentUser(null);
      console.log("\u{1F504} [App.handleLogout] Navigating to home page");
      navigate("/");
      showToast("You have been logged out.", "info");
      console.log("\u2705 [App.handleLogout] Logout complete");
    } catch (error) {
      console.error("\u274C [App.handleLogout] Logout failed:", error);
      showToast(`Logout failed: ${error.message}`, "error");
    }
  }, [currentUser, navigate, showToast]);
  const handleSelectPlan = useCallback9((plan) => {
    if (plan.price > 0) {
      setSelectedPlan(plan);
      navigate("/checkout");
    } else {
      showToast("The Free plan is selected by default.", "info");
    }
  }, [navigate, showToast]);
  const handleConfirmPurchase = useCallback9(async () => {
    if (currentUser && selectedPlan) {
      navigate("/success");
    }
  }, [currentUser, selectedPlan, navigate]);
  useEffect18(() => {
    if (location.pathname === "/interview" && !activeInterviewId) {
      navigate("/");
    }
    if (location.pathname === "/review" && !interviewResult) {
      navigate("/");
    }
  }, [location.pathname, activeInterviewId, interviewResult, navigate]);
  return /* @__PURE__ */ jsxs29("div", { className: "min-h-screen flex flex-col bg-slate-900", children: [
    /* @__PURE__ */ jsx31(Header_default, { currentUser, onLogout: handleLogout }),
    /* @__PURE__ */ jsx31("main", { className: "flex-1 flex flex-col", children: /* @__PURE__ */ jsxs29(Routes, { children: [
      /* @__PURE__ */ jsx31(Route, { path: "/", element: /* @__PURE__ */ jsx31(SetupScreen_default, { onStartInterview: handleStartInterview, modelSettings, currentUser, onLoginRequired: () => navigate("/login") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/login", element: /* @__PURE__ */ jsx31(LoginScreen_default, { onSwitchToRegister: () => navigate("/register") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/register", element: /* @__PURE__ */ jsx31(RegisterScreen_default, { onSwitchToLogin: () => navigate("/login"), onBackToSetup: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/community", element: /* @__PURE__ */ jsx31(CommunityScreen_default, { onBackToHome: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/learn", element: /* @__PURE__ */ jsx31(LearnScreen_default, { onBackToHome: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/features", element: /* @__PURE__ */ jsx31(FeaturesScreen_default, { onBackToHome: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/pricing", element: /* @__PURE__ */ jsx31(PricingScreen_default, { onBackToHome: () => navigate("/"), onSelectPlan: handleSelectPlan, currentUser, onNavigate: (view) => navigate(`/${view}`) }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/contact", element: /* @__PURE__ */ jsx31(ContactScreen_default, { onBackToHome: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/privacy", element: /* @__PURE__ */ jsx31(PrivacyScreen_default, { onBackToHome: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/terms", element: /* @__PURE__ */ jsx31(TermsScreen_default, { onBackToHome: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/checkout", element: /* @__PURE__ */ jsx31(CheckoutScreen_default, { plan: selectedPlan, currentUser, onConfirmPurchase: handleConfirmPurchase, onBack: () => navigate("/pricing") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/success", element: /* @__PURE__ */ jsx31(OrderSuccessScreen_default, { onBackToHome: () => navigate("/") }) }),
      /* @__PURE__ */ jsx31(Route, { path: "/history", element: /* @__PURE__ */ jsx31(HistoryScreen_default, { currentUser, onBackToHome: () => navigate("/") }) }),
      activeInterviewId && interviewSettings && /* @__PURE__ */ jsx31(Route, { path: "/interview", element: /* @__PURE__ */ jsx31(InterviewScreen_default, { interviewId: activeInterviewId, settings: interviewSettings, modelSettings, onEndInterview: handleEndInterview }) }),
      interviewResult && interviewSettings && /* @__PURE__ */ jsx31(Route, { path: "/review", element: /* @__PURE__ */ jsx31(PlaybackScreen_default, { ...interviewResult, settings: interviewSettings, onFinishReview: handleFinishReview, modelSettings, mode: interviewSettings.mode }) })
    ] }) }),
    /* @__PURE__ */ jsx31(Footer_default, { onNavigate: (view) => navigate(`/${view}`) })
  ] });
};
var App_default = App;

// index.tsx
import { jsx as jsx32 } from "react/jsx-runtime";
var rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
var root = ReactDOM.createRoot(rootElement);
root.render(
  /* @__PURE__ */ jsx32(React27.StrictMode, { children: /* @__PURE__ */ jsx32(ToastProvider, { children: /* @__PURE__ */ jsx32(HashRouter, { children: /* @__PURE__ */ jsx32(App_default, {}) }) }) })
);
/*! Bundled license information:

react-router/dist/development/chunk-UIGDSWPH.mjs:
  (**
   * react-router v7.9.5
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

react-router/dist/development/index.mjs:
  (**
   * react-router v7.9.5
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
