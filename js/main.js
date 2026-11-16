(function () {
  "use strict";
  var C = window.INVITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  };
  var linesHtml = function (arr) {
    return '<div class="lines">' + arr.map(function (l) {
      return l ? "<p>" + esc(l) + "</p>" : '<div class="gap"></div>';
    }).join("") + "</div>";
  };
  var cssUrl = function (u) { return "url('" + String(u).replace(/'/g, "%27") + "')"; };
  var DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  var target = new Date(C.date);
  var heart = '<span class="heart">♥</span>';

  /* ---------- 섹션 만들기 ---------- */
  var html = [];

  // 1. 커버
  html.push(
    '<section class="snap cover" id="cover">' +
      '<div class="cover-bg" style="background-image:' + cssUrl(C.photos.cover) + '"></div>' +
      '<div class="cover-script">' + esc(C.coverScript) + "</div>" +
      '<div class="cover-info">' +
        '<p class="cover-names">' + esc(C.groom.name) + " " + heart + " " + esc(C.bride.name) + "</p>" +
        '<p class="cover-date">' + esc(C.dateText) + "</p>" +
      "</div>" +
      '<span class="scroll-hint"></span>' +
    "</section>"
  );

  // 2. 인사말
  html.push(
    '<section class="snap greeting">' +
      '<h2 class="sec-title reveal">' + esc(C.greeting.title) + "</h2>" +
      '<div class="reveal" style="--i:1">' + linesHtml(C.greeting.lines) + "</div>" +
    "</section>"
  );

  // 3. 와이드 사진
  html.push(
    '<section class="snap photo-full"><div class="bg" style="background-image:' + cssUrl(C.photos.wide) + '"></div></section>'
  );

  // 4. 혼주
  var fam = function (p, role) {
    var parents = [p.father, p.mother].filter(Boolean);
    if (!parents.length) return "";
    return '<p class="row reveal"><b>' + parents.map(esc).join(" · ") + "</b>의 " + role +
      ' <span class="who">' + esc(p.shortName) + "</span></p>";
  };
  var famHtml = fam(C.groom, "아들") + fam(C.bride, "딸");
  var hasContacts = [C.groom, C.bride].some(function (p) {
    return p.phone || p.fatherPhone || p.motherPhone;
  });
  if (famHtml || hasContacts) {
    html.push(
      '<section class="snap family">' +
        famHtml +
        (hasContacts ? '<button class="btn reveal" id="contactBtn">연락하기</button>' : "") +
      "</section>"
    );
  }

  // 5. 날짜 + 캘린더
  html.push(
    '<section class="snap when">' +
      '<p class="big reveal">' + esc(C.dateText) + "</p>" +
      '<p class="hall reveal" style="--i:1">' + esc(C.venue.name) + (C.venue.hall ? "<br>" + esc(C.venue.hall) : "") + "</p>" +
      '<div class="cal reveal" style="--i:2" id="cal"></div>' +
    "</section>"
  );

  // 6. D-day
  html.push(
    '<section class="snap cream dday">' +
      '<p class="names reveal">' + esc(C.groom.shortName) + heart + esc(C.bride.shortName) + " 결혼식까지</p>" +
      '<div class="count reveal" style="--i:1" id="count">' +
        ["Days", "Hours", "Minutes", "Seconds"].map(function (l) {
          return '<div class="c"><span data-k="' + l + '">0</span>' + l + "</div>";
        }).join("") +
      "</div>" +
      '<p class="after reveal" style="--i:2" id="after"></p>' +
    "</section>"
  );

  // 7. 갤러리
  var g = C.photos.gallery, vis = C.photos.galleryVisible;
  html.push(
    '<section class="snap gallery">' +
      '<h2 class="sec-title reveal">갤러리</h2>' +
      '<div class="grid" id="grid">' +
        g.map(function (src, i) {
          return '<button data-i="' + i + '"' + (i >= vis ? " hidden" : "") + '><img loading="lazy" src="' + esc(src) + '" alt="웨딩 사진 ' + (i + 1) + '"></button>';
        }).join("") +
      "</div>" +
      (g.length > vis ? '<button class="more" id="more">더 보기 ⌄</button>' : "") +
    "</section>"
  );

  // 8. 게스트스냅 (링크가 있을 때만)
  if (C.guestSnapUrl) {
    html.push(
      '<section class="snap">' +
        '<h2 class="sec-title reveal">게스트스냅</h2>' +
        '<p class="sec-sub reveal">신랑·신부의 행복한 순간을 담아주세요</p>' +
        '<div class="snapbox reveal" style="--i:1">' +
          "<p>예식 당일의 순간들을<br>사진과 영상으로 남겨주세요.</p>" +
          '<hr><a class="btn gold" href="' + esc(C.guestSnapUrl) + '" target="_blank" rel="noopener">사진 및 영상 업로드</a>' +
        "</div>" +
      "</section>"
    );
  }

  // 9. 오시는 길
  var d = C.directions;
  var list = function (title, arr) {
    if (!arr || !arr.length) return "";
    return "<h4>" + title + "</h4><ul>" + arr.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  };
  var q = encodeURIComponent(C.venue.mapQuery || C.venue.name);
  html.push(
    '<section class="snap way">' +
      '<h2 class="sec-title reveal">오시는 길</h2>' +
      '<p class="venue reveal">' + esc(C.venue.name) + "</p>" +
      (C.venue.hall ? '<p class="addr reveal">' + esc(C.venue.hall) + "</p>" : "") +
      '<p class="addr reveal">' + esc(C.venue.address) + "</p>" +
      (C.venue.tel ? '<p class="addr tel reveal"><a href="tel:' + esc(C.venue.tel) + '">' + esc(C.venue.tel) + "</a></p>" : "") +
      '<div class="mapcard reveal">' +
        '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>' +
        "<small>아래 버튼으로 지도 앱에서 열어보세요</small>" +
      "</div>" +
      '<div class="mapbtns reveal">' +
        '<a class="btn" href="tmap://search?name=' + q + '">티맵</a>' +
        '<a class="btn" href="https://map.kakao.com/link/search/' + q + '" target="_blank" rel="noopener">카카오맵</a>' +
        '<a class="btn" href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">네이버지도</a>' +
      "</div>" +
      '<div class="info reveal">' +
        list("지하철", d.subway) + list("버스", d.bus) + list("자차", d.car) + list("주차 안내", d.parking) +
        (d.notice ? '<p class="notice">' + esc(d.notice) + "</p>" : "") +
      "</div>" +
    "</section>"
  );

  // 10. 참석 여부
  if (C.rsvpUrl) {
    html.push(
      '<section class="snap rsvp">' +
        '<h2 class="sec-title reveal">참석 여부 전달</h2>' +
        '<p class="reveal" style="--i:1">결혼식에 참석해 주시는 모든 분들을<br>더욱 특별하게 모시고자 하오니,<br>참석 여부 전달을 부탁드립니다.</p>' +
        '<a class="btn gold reveal" style="--i:2" href="' + esc(C.rsvpUrl) + '" target="_blank" rel="noopener">참석 여부 전달</a>' +
      "</section>"
    );
  }

  // 11. 마음 전하실 곳
  var accBlock = function (label, p, id) {
    var items = (p.accounts || []).map(function (a, i) {
      return '<div class="acct"><div class="t"><b>' + esc(a.holder) + "</b><br>" + esc(a.bank) + " " + esc(a.number) +
        '</div><button class="copy" data-copy="' + esc(a.number) + '">복사</button></div>';
    }).join("");
    return '<button class="acc-toggle" aria-expanded="false" data-acc="' + id + '">' + label + '<span class="chev">⌄</span></button>' +
      '<div class="acc-body" id="' + id + '">' + (items || '<div class="empty">계좌 정보가 아직 입력되지 않았어요.</div>') + "</div>";
  };
  html.push(
    '<section class="snap cream">' +
      '<h2 class="sec-title reveal">' + esc(C.closing.title) + "</h2>" +
      '<div class="reveal" style="--i:1">' + linesHtml(C.closing.lines) + "</div>" +
      '<div class="acc reveal" style="--i:2">' + accBlock("신랑측", C.groom, "acc-g") + accBlock("신부측", C.bride, "acc-b") + "</div>" +
      (C.closing.wreathNotice ? '<div class="wreath reveal">' + esc(C.closing.wreathNotice) + "</div>" : "") +
    "</section>"
  );

  // 12. 푸터
  html.push(
    '<footer class="snap footer">' +
      '<p class="sig">' + esc(C.groom.shortName) + " &amp; " + esc(C.bride.shortName) + "</p>" +
      '<p class="copy-line">' + target.getFullYear() + ". " + String(target.getMonth() + 1).padStart(2, "0") + ". " + String(target.getDate()).padStart(2, "0") + "</p>" +
    "</footer>"
  );

  $("#main").innerHTML = html.join("");

  /* ---------- 캘린더 ---------- */
  (function () {
    var y = target.getFullYear(), m = target.getMonth(), day = target.getDate();
    var first = new Date(y, m, 1).getDay();
    var last = new Date(y, m + 1, 0).getDate();
    var rows = "<tr>" + DAYS.map(function (n) { return "<th>" + n + "</th>"; }).join("") + "</tr><tr>";
    for (var i = 0; i < first; i++) rows += "<td></td>";
    for (var n = 1; n <= last; n++) {
      if ((first + n - 1) % 7 === 0 && n !== 1) rows += "</tr><tr>";
      rows += '<td class="' + (n === day ? "on" : "") + '"><span class="d">' + n + "</span></td>";
    }
    rows += "</tr>";
    $("#cal").innerHTML = '<div class="month">' + (m + 1) + "월</div><table>" + rows + "</table>";
  })();

  /* ---------- D-day ---------- */
  var cEls = {};
  document.querySelectorAll("#count [data-k]").forEach(function (el) { cEls[el.dataset.k] = el; });
  function tick() {
    var diff = target - new Date();
    var after = $("#after");
    if (diff <= 0) {
      Object.keys(cEls).forEach(function (k) { cEls[k].textContent = "0"; });
      after.textContent = "함께해 주셔서 감사합니다.";
      return;
    }
    var s = Math.floor(diff / 1000);
    cEls.Days.textContent = Math.floor(s / 86400);
    cEls.Hours.textContent = Math.floor(s % 86400 / 3600);
    cEls.Minutes.textContent = Math.floor(s % 3600 / 60);
    cEls.Seconds.textContent = s % 60;
    after.textContent = C.groom.shortName + "·" + C.bride.shortName + "의 결혼식이 " + Math.ceil(diff / 86400000) + "일 남았습니다.";
  }
  tick(); setInterval(tick, 1000);

  /* ---------- 스크롤 등장 ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- 토스트 ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }

  /* ---------- 계좌 펼치기 / 복사 ---------- */
  document.querySelectorAll(".acc-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      $("#" + b.dataset.acc).classList.toggle("open", !open);
    });
  });
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      var ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); } ta.remove();
    });
  }
  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      copyText(b.dataset.copy).then(function () { toast("계좌번호가 복사되었어요"); }, function () { toast("복사에 실패했어요"); });
    });
  });

  /* ---------- 혼주 연락 모달 ---------- */
  var cm = $("#contactModal");
  var cb = $("#contactBtn");
  if (cb) {
    var rows = [];
    [[C.groom, "신랑"], [C.bride, "신부"]].forEach(function (pair) {
      var p = pair[0], r = pair[1];
      [[p.phone, r + " " + p.shortName], [p.fatherPhone, r + "측 아버지"], [p.motherPhone, r + "측 어머니"]].forEach(function (x) {
        if (x[0]) rows.push('<div class="contact-row"><span>' + esc(x[1]) + '</span><span class="acts"><a href="tel:' + esc(x[0]) + '">전화</a><a href="sms:' + esc(x[0]) + '">문자</a></span></div>');
      });
    });
    $("#contactList").innerHTML = rows.join("");
    cb.addEventListener("click", function () { cm.hidden = false; });
    cm.addEventListener("click", function (e) { if (e.target === cm || e.target.hasAttribute("data-close")) cm.hidden = true; });
  }

  /* ---------- 갤러리 더 보기 + 라이트박스 ---------- */
  var more = $("#more");
  if (more) more.addEventListener("click", function () {
    document.querySelectorAll("#grid button[hidden]").forEach(function (b) { b.hidden = false; });
    more.remove();
  });
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCount = $("#lbCount"), cur = 0;
  function show(i) {
    cur = (i + g.length) % g.length;
    lbImg.src = g[cur]; lbCount.textContent = (cur + 1) + " / " + g.length;
  }
  $("#grid").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-i]"); if (!b) return;
    show(+b.dataset.i); lb.hidden = false; document.body.style.overflow = "hidden";
  });
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }
  lb.querySelector("[data-close]").addEventListener("click", closeLb);
  lb.querySelector(".prev").addEventListener("click", function () { show(cur - 1); });
  lb.querySelector(".next").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  var sx = 0;
  lbImg.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lbImg.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });

  /* ---------- 맨 위로 / 공유 ---------- */
  $("#toTop").addEventListener("click", function () { animateTo(0); });
  $("#shareBtn").addEventListener("click", function () {
    var data = { title: document.title, text: C.dateText, url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else copyText(location.href).then(function () { toast("링크가 복사되었어요"); }, function () { toast(location.href); });
  });


  /* ---------- 섹션 단위 부드러운 페이지 넘김 ----------
   * 마우스 휠/트랙패드/키보드: 한 번 움직이면 다음 섹션까지 부드럽게 미끄러져 이동해요.
   * 터치(휴대폰): 브라우저 기본 스냅 스크롤을 그대로 써요 (손가락 스와이프가 가장 자연스러워서).
   * 한 화면보다 긴 섹션(오시는 길 등)은 그 안에서 먼저 아래까지 내려간 뒤 다음 섹션으로 넘어가요.
   */
  var root = document.documentElement;
  var secs = [].slice.call(document.querySelectorAll("#main > *"));
  var touchMode = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = reduceMotion ? 1 : 900;           // 이동 시간(ms). 더 천천히 하려면 숫자를 키우세요.
  var anim = null, lockUntil = 0;

  root.style.scrollBehavior = "auto";
  if (!touchMode) root.style.scrollSnapType = "none";   // 데스크톱은 직접 애니메이션으로 넘겨요
  var snapDefault = touchMode ? "" : "none";

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function cancelAnim() {
    if (!anim) return;
    cancelAnimationFrame(anim.raf); anim = null; root.style.scrollSnapType = snapDefault;
  }
  function animateTo(y) {
    var start = window.pageYOffset, dist = y - start;
    if (Math.abs(dist) < 2) return false;
    cancelAnim();
    var t0 = performance.now(), me = anim = { raf: 0 };
    root.style.scrollSnapType = "none";
    (function step(now) {
      var p = Math.min(1, (now - t0) / DUR);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) { me.raf = requestAnimationFrame(step); }
      else { if (anim === me) anim = null; root.style.scrollSnapType = snapDefault; }
    })(t0);
    return true;
  }
  function pageStep(dir) {
    var vh = window.innerHeight, y = window.pageYOffset;
    var maxY = root.scrollHeight - vh;
    var geo = secs.map(function (el) { var r = el.getBoundingClientRect(); return { top: r.top + y, bottom: r.bottom + y }; });
    var i = 0;
    for (var k = 0; k < geo.length; k++) { if (geo[k].top <= y + 2) i = k; }
    var g = geo[i], tall = g.bottom - g.top > vh + 4, target;
    if (dir > 0) {
      if (tall && g.bottom - (y + vh) > 2) target = Math.min(y + vh * 0.85, g.bottom - vh);
      else if (i + 1 < geo.length) target = geo[i + 1].top;
      else target = maxY;
      target = Math.min(target, maxY);
    } else {
      if (y > g.top + 2) target = tall ? Math.max(g.top, y - vh * 0.85) : g.top;
      else if (i > 0) { var pv = geo[i - 1]; target = (pv.bottom - pv.top > vh + 4) ? pv.bottom - vh : pv.top; }
      else target = 0;
      target = Math.max(0, target);
    }
    return animateTo(target);
  }
  function overlayOpen() { return !lb.hidden || !cm.hidden; }

  if (!touchMode) {
    var lastT = 0, lastA = 0;
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;                                  // 확대/축소는 그대로
      if (overlayOpen()) { e.preventDefault(); return; }
      var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (Math.abs(e.deltaX) > Math.abs(dy)) return;          // 가로 스크롤은 무시
      var a = Math.abs(dy), now = performance.now();
      // 새 제스처인지 판단: 트랙패드 관성(점점 줄어드는 입력)은 무시하고, 새로 굴린 입력만 인정
      var fresh = (now - lastT > 100) || (a > lastA * 1.6 && a >= 20);
      lastT = now; lastA = a;
      e.preventDefault();
      if (anim || now < lockUntil || !fresh || a < 4) return;
      if (pageStep(dy > 0 ? 1 : -1)) lockUntil = now + DUR + 120;
    }, { passive: false });

    window.addEventListener("keydown", function (e) {
      if (overlayOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target || {};
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      var dir = 0, k = e.key;
      if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey && !/^(BUTTON|A)$/.test(t.tagName))) dir = 1;
      else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) dir = -1;
      else if (k === "Home") { e.preventDefault(); animateTo(0); return; }
      else if (k === "End") { e.preventDefault(); animateTo(root.scrollHeight - window.innerHeight); return; }
      if (!dir) return;
      e.preventDefault();
      if (!anim) pageStep(dir);
    });
    // 스크롤바를 직접 잡아 끌 때는 애니메이션을 멈춰요
    window.addEventListener("mousedown", function (e) { if (e.target === root) cancelAnim(); });
  }
  window.addEventListener("touchstart", cancelAnim, { passive: true });

  /* ---------- 배경음악 ---------- */
  var bgm = $("#bgm"), mb = $("#musicBtn");
  if (C.music && C.music.src) {
    bgm.src = C.music.src; mb.hidden = false; mb.classList.add("off");
    var userSet = false;
    var sync = function () { mb.classList.toggle("off", bgm.paused); };
    bgm.addEventListener("play", sync); bgm.addEventListener("pause", sync);
    bgm.addEventListener("error", function () { mb.hidden = true; });
    mb.addEventListener("click", function () {
      userSet = true; bgm.paused ? bgm.play().catch(function () {}) : bgm.pause();
    });
    // 브라우저 정책상 자동재생은 막혀 있어서, 첫 터치/클릭 때 재생을 시도해요.
    var first = function () {
      if (!userSet && bgm.paused) bgm.play().catch(function () {});
      ["touchend", "click"].forEach(function (ev) { document.removeEventListener(ev, first); });
    };
    ["touchend", "click"].forEach(function (ev) { document.addEventListener(ev, first); });
  }
})();
