/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

(function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=self.Prism={util:{type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var r={};for(var i in e)e.hasOwnProperty(i)&&(r[i]=t.util.clone(e[i]));return r;case"Array":return e.slice()}return e}},languages:{extend:function(e,n){var r=t.util.clone(t.languages[e]);for(var i in n)r[i]=n[i];return r},insertBefore:function(e,n,r,i){i=i||t.languages;var s=i[e],o={};for(var u in s)if(s.hasOwnProperty(u)){if(u==n)for(var a in r)r.hasOwnProperty(a)&&(o[a]=r[a]);o[u]=s[u]}return i[e]=o},DFS:function(e,n){for(var r in e){n.call(e,r,e[r]);t.util.type(e)==="Object"&&t.languages.DFS(e[r],n)}}},highlightAll:function(e,n){var r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');for(var i=0,s;s=r[i++];)t.highlightElement(s,e===!0,n)},highlightElement:function(r,i,s){var o,u,a=r;while(a&&!e.test(a.className))a=a.parentNode;if(a){o=(a.className.match(e)||[,""])[1];u=t.languages[o]}if(!u)return;r.className=r.className.replace(e,"").replace(/\s+/g," ")+" language-"+o;a=r.parentNode;/pre/i.test(a.nodeName)&&(a.className=a.className.replace(e,"").replace(/\s+/g," ")+" language-"+o);var f=r.textContent;if(!f)return;f=f.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\u00a0/g," ");var l={element:r,language:o,grammar:u,code:f};t.hooks.run("before-highlight",l);if(i&&self.Worker){var c=new Worker(t.filename);c.onmessage=function(e){l.highlightedCode=n.stringify(JSON.parse(e.data));l.element.innerHTML=l.highlightedCode;s&&s.call(l.element);t.hooks.run("after-highlight",l)};c.postMessage(JSON.stringify({language:l.language,code:l.code}))}else{l.highlightedCode=t.highlight(l.code,l.grammar);l.element.innerHTML=l.highlightedCode;s&&s.call(r);t.hooks.run("after-highlight",l)}},highlight:function(e,r){return n.stringify(t.tokenize(e,r))},tokenize:function(e,n){var r=t.Token,i=[e],s=n.rest;if(s){for(var o in s)n[o]=s[o];delete n.rest}e:for(var o in n){if(!n.hasOwnProperty(o)||!n[o])continue;var u=n[o],a=u.inside,f=!!u.lookbehind||0;u=u.pattern||u;for(var l=0;l<i.length;l++){var c=i[l];if(i.length>e.length)break e;if(c instanceof r)continue;u.lastIndex=0;var h=u.exec(c);if(h){f&&(f=h[1].length);var p=h.index-1+f,h=h[0].slice(f),d=h.length,v=p+d,m=c.slice(0,p+1),g=c.slice(v+1),y=[l,1];m&&y.push(m);var b=new r(o,a?t.tokenize(h,a):h);y.push(b);g&&y.push(g);Array.prototype.splice.apply(i,y)}}}return i},hooks:{all:{},add:function(e,n){var r=t.hooks.all;r[e]=r[e]||[];r[e].push(n)},run:function(e,n){var r=t.hooks.all[e];if(!r||!r.length)return;for(var i=0,s;s=r[i++];)s(n)}}},n=t.Token=function(e,t){this.type=e;this.content=t};n.stringify=function(e){if(typeof e=="string")return e;if(Object.prototype.toString.call(e)=="[object Array]"){for(var r=0;r<e.length;r++)e[r]=n.stringify(e[r]);return e.join("")}var i={type:e.type,content:n.stringify(e.content),tag:"span",classes:["token",e.type],attributes:{}};i.type=="comment"&&(i.attributes.spellcheck="true");t.hooks.run("wrap",i);var s="";for(var o in i.attributes)s+=o+'="'+(i.attributes[o]||"")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'" '+s+">"+i.content+"</"+i.tag+">"};if(!self.document){self.addEventListener("message",function(e){var n=JSON.parse(e.data),r=n.language,i=n.code;self.postMessage(JSON.stringify(t.tokenize(i,t.languages[r])));self.close()},!1);return}var r=document.getElementsByTagName("script");r=r[r.length-1];if(r){t.filename=r.src;document.addEventListener&&!r.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)}})();;
(function(){function e(e,t){return Array.prototype.slice.call((t||document).querySelectorAll(e))}function n(e,t,n){var r=t.replace(/\s+/g,"").split(","),i=+e.getAttribute("data-line-offset")||0,s=parseFloat(getComputedStyle(e).lineHeight);for(var o=0,u;u=r[o++];){u=u.split("-");var a=+u[0],f=+u[1]||a,l=document.createElement("div");l.textContent=Array(f-a+2).join(" \r\n");l.className=(n||"")+" line-highlight";l.setAttribute("data-start",a);f>a&&l.setAttribute("data-end",f);l.style.top=(a-i-1)*s+"px";(e.querySelector("code")||e).appendChild(l)}}function r(){var t=location.hash.slice(1);e(".temporary.line-highlight").forEach(function(e){e.parentNode.removeChild(e)});var r=(t.match(/\.([\d,-]+)$/)||[,""])[1];if(!r||document.getElementById(t))return;var i=t.slice(0,t.lastIndexOf(".")),s=document.getElementById(i);if(!s)return;s.hasAttribute("data-line")||s.setAttribute("data-line","");n(s,r,"temporary ");document.querySelector(".temporary.line-highlight").scrollIntoView()}if(!window.Prism)return;var t=crlf=/\r?\n|\r/g,i=0;Prism.hooks.add("after-highlight",function(t){var s=t.element.parentNode,o=s&&s.getAttribute("data-line");if(!s||!o||!/pre/i.test(s.nodeName))return;clearTimeout(i);e(".line-highlight",s).forEach(function(e){e.parentNode.removeChild(e)});n(s,o);i=setTimeout(r,1)});addEventListener("hashchange",r)})();;

Prism.languages.markup = {
  comment: /&lt;!--[\w\W]*?--(&gt;|&gt;)/g,
  prolog: /&lt;\?.+?\?&gt;/,
  doctype: /&lt;!DOCTYPE.+?&gt;/,
  cdata: /&lt;!\[CDATA\[[\w\W]+?]]&gt;/i,
  tag: {
    pattern: /&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?&gt;/gi,
    inside: {
      tag: {
        pattern: /^&lt;\/?[\w:-]+/i,
        inside: {
          punctuation: /^&lt;\/?/,
          namespace: /^[\w-]+?:/
        }
      },
      "attr-value": {
        pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
        inside: {
          punctuation: /=|&gt;|"/g
        }
      },
      punctuation: /\/?&gt;/g,
      "attr-name": {
        pattern: /[\w:-]+/g,
        inside: {
          namespace: /^[\w-]+?:/
        }
      }
    }
  },
  entity: /&amp;#?[\da-z]{1,8};/gi
};

Prism.hooks.add("wrap", function(e) {
  e.type === "entity" && (e.attributes.title = e.content.replace(/&amp;/, "&"))
});

Prism.languages.css = {
  comment: /\/\*[\w\W]*?\*\//g,
  atrule: /@[\w-]+?(\s+[^;{]+)?(?=\s*{|\s*;)/gi,
  url: /url\((["']?).*?\1\)/gi,
  selector: /[^\{\}\s][^\{\}]*(?=\s*\{)/g,
  property: /(\b|\B)[a-z-]+(?=\s*:)/ig,
  string: /("|')(\\?.)*?\1/g,
  important: /\B!important\b/gi,
  ignore: /&(lt|gt|amp);/gi,
  punctuation: /[\{\};:]/g
};

Prism.languages.markup && Prism.languages.insertBefore("markup", "tag", {
  style: {
    pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/style(>|&gt;)/ig,
    inside: {
      tag: {
        pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)|(&lt;|<)\/style(>|&gt;)/ig,
        inside: Prism.languages.markup.tag.inside
      },
      rest: Prism.languages.css
    }
  }
});;

Prism.languages.clike = {
  comment: {
    pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
    lookbehind: !0
  },
  string: /("|')(\\?.)*?\1/g,
  keyword: /\b(if|else|while|do|for|return|in|instanceof|function|new|try|catch|finally|null|break|continue)\b/g,
  "boolean": /\b(true|false)\b/g,
  number: /\b-?(0x)?\d*\.?[\da-f]+\b/g,
  operator: /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g,
  ignore: /&(lt|gt|amp);/gi,
  punctuation: /[{}[\];(),.:]/g
};;

Prism.languages.javascript = Prism.languages.extend("clike", {
  keyword: /\b(var|let|if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|catch|finally|null|break|continue)\b/g,
  number: /\b(-?(0x)?\d*\.?[\da-f]+|NaN|-?Infinity)\b/g
});

Prism.languages.insertBefore("javascript", "keyword", {
  regex: {
    pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
    lookbehind: !0
  }
});

Prism.languages.markup && Prism.languages.insertBefore("markup", "tag", {
  script: {
    pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/ig,
    inside: {
      tag: {
        pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/ig,
        inside: Prism.languages.markup.tag.inside
      },
      rest: Prism.languages.javascript
    }
  }
});

// borrowed from https://github.com/samflores
Prism.languages.ruby = {
  'comment': /#[^\r\n]*(\r?\n|$)/g,
  'string': /("|')(\\?.)*?\1/g,
  'regex': {
    pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
    lookbehind: true
  },
  'keyword': /\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/g,
  'builtin': /\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,
  'boolean': /\b(true|false)\b/g,
  'number': /\b-?(0x)?\d*\.?\d+\b/g,
  'operator': /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g,
  'inst-var': /[@&]\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
  'namespace': /::\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
  'symbol': /:\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
  'const': /\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g,
  'ignore': /&(lt|gt|amp);/gi,
  'punctuation': /[{}[\];(),.:]/g
};

// Prism.languages.coffee = {
  // 'keyword':/\b(case|default|function|var|void|with|const|let|enum|exports|export|import|native|__hasProp|__extends|__slice|__bind|__indexOf|in|if|for|while|finally|new|do|return|else|break|catch|instanceof|throw|try|this|switch|continue|typeof|delete|return|debugger|class|extends|super|then|unless|until|loopofby|when|and|or|is|isnt|not)\b/g,
  // 'builtin':/\bClass|String|Number|Object\b/g,
  // 'string': /("|')(\\?.)*?\1/g,
  // 'comment': /#[^\r\n]*(\r?\n|$)/g,
  // 'regex': {
  //   pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
  //   lookbehind: true
  // },
  // 'boolean': /\b(true|false|yes|no)\b/g,
  // 'number': /\b-?(0x)?\d*\.?\d+\b/g,
  // 'arrow': /(-|=)&gt;/g,
  // 'operator': /[-+]{1,2}|!|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g,
  // 'var': /[@&]\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
  // 'class': /\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g,
  // 'ignore': /&(lt|gt|amp);/gi,
  // 'punctuation': /[{}[\];(),.:]/g
  // 'conditional' : /\b(if|else|unless|switch|when|then)\b/g,


Prism.languages.coffee = {
  'Reserved': /\b(case|default|function|var|void|with|const|let|enum|export|import|native|__hasProp|__extends|__slice|__bind|__indexOf|implements|interface|let|package|private|protected|public|static|yield)\b/g,
  'String': /("|')(\\?.)*?\1/g,
  'Number': /\b-?(0x)?\d*\.?\d+\b/g,
  'Statement': /\b(return|break|continue|throw)\b/g,
  'Repeat': /\b(for|while|until|loop)\b/g,
  'Conditional': /\b(if|else|unless|switch|when|then)\b/g,
  'Exception': /\b(try|catch|finally)\b/g,
  'Keyword': /\b(new|in|of|by|and|or|not|is|isnt|class|extends|super|do|return)\b/g,
  'Namespace' : /::\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
  // 'Operator': /\b(instanceof|typeof|delete)\b/g,
  'Operator': /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g,
  'Boolean': /\b(true|on|yes|false|off|no)\b/g,
  'Global': /\b(null|undefined)\b/g,
  'SpecialVar': /\b(this|prototype|arguments)\b/g,
  'SpecialIdent': /@\%(\I\i*)\?/g,
  'Object': /\b[A_Z]\w+\b/g,
  'InstanceVar': /[@&]\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/,
  'Constant': /\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g,
  'Comment': /#.*/g
};




Prism.languages.php = {
  'comment': {
    pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
    lookbehind: true
  },
  'deliminator': /(\?>|\?&gt;|&lt;\?php|<\?php)/ig,
  'variable': /(\$\w+)\b/ig,
  'string': /("|')(\\?.)*?\1/g,
  'regex': {
    pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
    lookbehind: true
  },
  'keyword': /\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|extends|private|protected|throw)\b/g,
  'function': /\b(abs|acos|acosh|addcslashes|addslashes|array_change_key_case|array_chunk|array_combine|array_count_values|array_diff|array_diff_assoc|array_diff_key|array_diff_uassoc|array_diff_ukey|array_fill|array_filter|array_flip|array_intersect|array_intersect_assoc|array_intersect_key|array_intersect_uassoc|array_intersect_ukey|array_key_exists|array_keys|array_map|array_merge|array_merge_recursive|array_multisort|array_pad|array_pop|array_product|array_push|array_rand|array_reduce|array_reverse|array_search|array_shift|array_slice|array_splice|array_sum|array_udiff|array_udiff_assoc|array_udiff_uassoc|array_uintersect|array_uintersect_assoc|array_uintersect_uassoc|array_unique|array_unshift|array_values|array_walk|array_walk_recursive|atan|atan2|atanh|base64_decode|base64_encode|base_convert|basename|bcadd|bccomp|bcdiv|bcmod|bcmul|bindec|bindtextdomain|bzclose|bzcompress|bzdecompress|bzerrno|bzerror|bzerrstr|bzflush|bzopen|bzread|bzwrite|ceil|chdir|checkdate|checkdnsrr|chgrp|chmod|chop|chown|chr|chroot|chunk_split|class_exists|closedir|closelog|copy|cos|cosh|count|count_chars|date|decbin|dechex|decoct|deg2rad|delete|ebcdic2ascii|echo|empty|end|ereg|ereg_replace|eregi|eregi_replace|error_log|error_reporting|escapeshellarg|escapeshellcmd|eval|exec|exit|exp|explode|extension_loaded|feof|fflush|fgetc|fgetcsv|fgets|fgetss|file_exists|file_get_contents|file_put_contents|fileatime|filectime|filegroup|fileinode|filemtime|fileowner|fileperms|filesize|filetype|floatval|flock|floor|flush|fmod|fnmatch|fopen|fpassthru|fprintf|fputcsv|fputs|fread|fscanf|fseek|fsockopen|fstat|ftell|ftok|getallheaders|getcwd|getdate|getenv|gethostbyaddr|gethostbyname|gethostbynamel|getimagesize|getlastmod|getmxrr|getmygid|getmyinode|getmypid|getmyuid|getopt|getprotobyname|getprotobynumber|getrandmax|getrusage|getservbyname|getservbyport|gettext|gettimeofday|gettype|glob|gmdate|gmmktime|ini_alter|ini_get|ini_get_all|ini_restore|ini_set|interface_exists|intval|ip2long|is_a|is_array|is_bool|is_callable|is_dir|is_double|is_executable|is_file|is_finite|is_float|is_infinite|is_int|is_integer|is_link|is_long|is_nan|is_null|is_numeric|is_object|is_readable|is_real|is_resource|is_scalar|is_soap_fault|is_string|is_subclass_of|is_uploaded_file|is_writable|is_writeable|mkdir|mktime|nl2br|parse_ini_file|parse_str|parse_url|passthru|pathinfo|readlink|realpath|rewind|rewinddir|rmdir|round|str_ireplace|str_pad|str_repeat|str_replace|str_rot13|str_shuffle|str_split|str_word_count|strcasecmp|strchr|strcmp|strcoll|strcspn|strftime|strip_tags|stripcslashes|stripos|stripslashes|stristr|strlen|strnatcasecmp|strnatcmp|strncasecmp|strncmp|strpbrk|strpos|strptime|strrchr|strrev|strripos|strrpos|strspn|strstr|strtok|strtolower|strtotime|strtoupper|strtr|strval|substr|substr_compare)\b/g,
  'constant': /\b(__FILE__|__LINE__|__METHOD__|__FUNCTION__|__CLASS__)\b/g,
  'boolean': /\b(true|false)\b/g,
  'number': /\b-?(0x)?\d*\.?\d+\b/g,
  'operator': /[-+]{1,2}|!|=?\<|=?\>;|={1,2}(?!>)|(\&){1,2}|\|?\||\?|\*|\//g,
  'punctuation': /[{}[\];(),.:]/g
};

Prism.languages.markup && Prism.languages.insertBefore('php', 'comment', {
  'markup': {
    pattern: /(\?>|\?&gt;)[\w\W]*?(?=(&lt;\?php|<\?php))/ig,
    lookbehind : true,
    inside: {
      'markup': {
        pattern: /&lt;\/?[\w:-]+\s*[\w\W]*?&gt;/gi,
        inside: Prism.languages.markup.tag.inside
      },
      rest: Prism.languages.php
    }
  }
});
