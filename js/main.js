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
      return l ? "<p>" + esc(l).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") + "</p>" : '<div class="gap"></div>';
    }).join("") + "</div>";
  };
  var cssUrl = function (u) { return "url('" + String(u).replace(/'/g, "%27") + "')"; };
  var DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  var target = new Date(C.date);
  var heart = '<span class="heart">♥</span>';

  /* ---------- 손글씨처럼 써지는 글씨 ---------- */
  function scriptLines(text, startDelay) {
    var lines = String(text).split(/\n|\|/);
    if (lines.length === 1) {                       // 줄바꿈이 없으면 단어 수 기준으로 2줄로 나눠요
      var w = lines[0].split(" ");
      if (w.length > 2) { var h = Math.ceil(w.length / 2); lines = [w.slice(0, h).join(" "), w.slice(h).join(" ")]; }
    }
    return lines.map(function (ln, i) {
      return '<span class="wl" style="--d:' + (startDelay + i * 1.1).toFixed(2) + 's"><span>' + esc(ln.trim()) + "</span></span>";
    }).join("");
  }

  /* ---------- 섹션 만들기 ---------- */
  var html = [];

  // 1. 커버
  html.push(
    '<section class="snap cover" id="cover">' +
      '<div class="cover-bg" style="background-image:' + cssUrl(C.photos.cover) + '"></div>' +
      '<div class="cover-script">' + scriptLines(C.coverScript || "We're getting married!", 0.5) + "</div>" +
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

  // 8. 게스트스냅 (문구는 config.js 의 guestSnap 에서 바꿔요. 링크가 없으면 '준비 중' 안내)
  var GS = C.guestSnap || {};
  html.push(
    '<section class="snap">' +
      '<h2 class="sec-title reveal">' + esc(GS.title || "게스트스냅") + "</h2>" +
      '<p class="sec-sub reveal">' + esc(GS.sub || "신랑·신부의 행복한 순간을 담아주세요") + "</p>" +
      '<div class="snapbox reveal" style="--i:1">' +
        "<p>" + (GS.lines || ["예식 당일의 순간들을", "사진과 영상으로 남겨주세요."]).map(function (l) { return esc(l).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }).join("<br>") + "</p>" +
        '<hr>' +
        (C.guestSnapUrl
          ? '<a class="btn gold" href="' + esc(C.guestSnapUrl) + '" target="_blank" rel="noopener">' + esc(GS.button || "사진 및 영상 업로드") + "</a>"
          : '<button class="btn gold" type="button" id="snapSoon">' + esc(GS.button || "사진 및 영상 업로드") + "</button>") +
      "</div>" +
    "</section>"
  );

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
      '<div class="mapcard reveal" id="mapBox">' +
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

  $("#main").innerHTML = html.join("");
  if ($("#snapSoon")) $("#snapSoon").addEventListener("click", function () { toast("업로드 링크를 준비 중이에요"); });

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

  /* ---------- 카카오맵 (config.js 의 map.key 를 넣으면 지도가 나타나요) ---------- */
  (function () {
    var M = C.map || {};
    var box = $("#mapBox");
    if (!M.key || !box || !("IntersectionObserver" in window)) return;   // 키가 없으면 안내 카드 + 지도 앱 버튼 그대로

    function show(lat, lng) {
      var pos = new kakao.maps.LatLng(lat, lng);
      box.innerHTML = "";
      box.classList.add("has-map");
      var map = new kakao.maps.Map(box, { center: pos, level: M.level || 3 });
      new kakao.maps.Marker({ position: pos }).setMap(map);
      // 페이지 스크롤·스와이프와 겹치지 않도록 지도는 고정해 두고, 누르면 카카오맵이 열려요
      map.setDraggable(false);
      map.setZoomable(false);
      box.addEventListener("click", function () {
        window.open("https://map.kakao.com/link/map/" + encodeURIComponent(C.venue.name) + "," + lat + "," + lng, "_blank", "noopener");
      });
    }
    function init() {
      if (M.lat && M.lng) { show(+M.lat, +M.lng); return; }          // 좌표를 직접 넣었으면 그대로 사용
      var q = C.venue.mapQuery || C.venue.name;
      new kakao.maps.services.Places().keywordSearch(q, function (res, status) {
        if (status === kakao.maps.services.Status.OK && res[0]) { show(+res[0].y, +res[0].x); return; }
        new kakao.maps.services.Geocoder().addressSearch(C.venue.address, function (r2, st2) {   // 이름으로 못 찾으면 주소로 다시 검색
          if (st2 === kakao.maps.services.Status.OK && r2[0]) show(+r2[0].y, +r2[0].x);
        });
      });
    }
    function load() {
      var sc = document.createElement("script");
      sc.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=" + encodeURIComponent(M.key) + "&libraries=services&autoload=false";
      sc.onload = function () { try { kakao.maps.load(init); } catch (e) {} };
      document.head.appendChild(sc);                                  // 실패하면 안내 카드가 그대로 남아요
    }
    // 지도 근처까지 스크롤했을 때만 불러와서 불필요한 호출을 줄여요
    var mio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { mio.disconnect(); load(); }
    }, { rootMargin: "800px 0px" });
    mio.observe(box);
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
  /* ---------- 공유하기: 카카오톡 카드 보내기 ----------
   * config.js 의 map.key (카카오 JavaScript 키)가 있으면 '카카오톡으로 보내기'가 나타나요.
   * 카드 모양: 사진 + 제목 + 날짜 + 버튼 2개(청첩장 보기 / 위치 보기)
   */
  var KAKAO_SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js";
  var kakaoKey = (C.map && C.map.key) || "";
  var SH = C.share || {};
  var sm = document.createElement("div");
  sm.className = "modal"; sm.hidden = true;
  sm.innerHTML =
    '<div class="modal-card">' +
      "<h3>청첩장 공유하기</h3>" +
      (kakaoKey ? '<label class="field"><span>받는 분 (선택)</span><input id="shareTo" type="text" maxlength="24" placeholder="예: 운영지원단 선생님들" autocomplete="off"></label>' +
                  '<p class="hint">입력하면 카드 제목이 \'OOO에게\'로 나가요.</p>' : "") +
      '<div class="share-actions">' +
        (kakaoKey ? '<button class="btn gold" id="shareKakao" type="button">카카오톡으로 보내기</button>' : "") +
        '<button class="btn" id="shareCopy" type="button">링크 복사</button>' +
      "</div>" +
      '<button class="btn ghost" data-close type="button">닫기</button>' +
    "</div>";
  $("#app").appendChild(sm);
  sm.addEventListener("click", function (e) { if (e.target === sm || e.target.hasAttribute("data-close")) sm.hidden = true; });

  function siteUrl() { return location.origin + location.pathname; }
  function absUrl(p) { try { return new URL(p, location.href).href; } catch (e) { return p; } }

  var kakaoReady = false;
  function loadKakao() {
    if (!kakaoKey || window.Kakao) { initKakao(); return; }
    var sc = document.createElement("script");
    sc.src = KAKAO_SDK;
    sc.onload = initKakao;
    document.head.appendChild(sc);
  }
  function initKakao() {
    try {
      if (window.Kakao && !Kakao.isInitialized()) Kakao.init(kakaoKey);
      kakaoReady = !!(window.Kakao && Kakao.isInitialized());
    } catch (e) { kakaoReady = false; }
  }
  // 버튼을 눌렀을 때 바로 공유창이 뜨도록, 페이지를 연 뒤 미리 불러와요
  if (kakaoKey) window.addEventListener("load", function () { setTimeout(loadKakao, 800); });

  function sendKakao() {
    if (!kakaoReady) { loadKakao(); toast("잠시 후 다시 눌러주세요"); return; }
    var to = ($("#shareTo") && $("#shareTo").value || "").trim();
    var names = C.groom.shortName + " ♥ " + C.bride.shortName + " 결혼합니다";
    var url = siteUrl();
    var link = function (u) { return { mobileWebUrl: u, webUrl: u }; };
    try {
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: to ? to + "에게" : names,
          description: to ? names + "\n" + C.dateText : C.dateText + "\n" + C.venue.name,
          imageUrl: absUrl(SH.image || C.photos.cover),
          link: link(url)
        },
        buttons: [
          { title: SH.buttonA || "청첩장 보기", link: link(url) },
          { title: SH.buttonB || "위치 보기", link: link(url + "#way") }
        ]
      });
    } catch (e) { toast("카카오톡 공유를 열지 못했어요"); }
  }
  $("#shareBtn").addEventListener("click", function () {
    if (kakaoKey) { sm.hidden = false; return; }
    var data = { title: document.title, text: C.dateText, url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else copyText(location.href).then(function () { toast("링크가 복사되었어요"); }, function () { toast(location.href); });
  });
  $("#shareCopy").addEventListener("click", function () {
    copyText(siteUrl()).then(function () { toast("링크가 복사되었어요"); sm.hidden = true; }, function () { toast(siteUrl()); });
  });
  if ($("#shareKakao")) $("#shareKakao").addEventListener("click", sendKakao);

  // 카드의 '위치 보기' 버튼으로 들어오면 오시는 길로 바로 이동
  function goWay() {
    var el = document.querySelector(".way");
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset);
  }
  if (location.hash === "#way") { goWay(); window.addEventListener("load", function () { setTimeout(goWay, 150); }); }


  /* ---------- 부드러운 스크롤 + 섹션에 맞춰 멈추기 ----------
   * 마우스 휠/터치패드: 굴린 만큼 부드럽게 흐르다가, 멈추면 가까운 섹션 위치에 살짝 맞춰져요.
   *   (휠 한 칸만 굴려도 다음 섹션으로 부드럽게 넘어가요)
   * 키보드/맨 위로 버튼/휴대폰 터치: 한 섹션씩 부드럽게 이동해요.
   * 한 화면보다 긴 섹션(갤러리·오시는 길)은 위/아래 끝에 맞춰지고, 아주 긴 경우엔 중간에도 멈출 수 있어요.
   * ※ 윈도우의 '애니메이션 효과 끄기' 설정이 켜져 있어도 이 이동은 부드럽게 동작해요.
   */
  var root = document.documentElement;
  window.__paging = "v5";   // 배포된 main.js 버전 확인용 (콘솔에서 window.__paging 입력)
  var secs = [].slice.call(document.querySelectorAll("#main > *"));
  var DUR = 900;               // 키보드·터치 이동 시간(ms)
  var TAU = 130;               // 휠 이동의 부드러움(ms). 클수록 더 천천히, 작을수록 더 빠르게 미끄러져요.
  var SETTLE_IDLE = 140;       // 휠을 멈추고 이 시간(ms)이 지나면 가까운 섹션에 맞춰요
  var anim = null, lockUntil = 0;
  var FREE = C.scrollMode !== "snap";   // 기본: 끊김 없이 자연스럽게 흐르는 스크롤 / "snap" 이면 섹션 단위 이동
  if (FREE) document.body.classList.add("free");

  root.style.scrollBehavior = "auto";
  root.style.scrollSnapType = "none";   // 브라우저 기본 스냅(뚝 끊기는 이동)은 끄고, 직접 부드럽게 넘겨요
  var snapDefault = "none";

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function maxScrollY() { return Math.max(0, root.scrollHeight - window.innerHeight); }
  function overlayOpen() { return root.classList.contains("intro-lock") || !lb.hidden || !cm.hidden || (typeof sm !== "undefined" && sm && !sm.hidden); }

  /* --- 휠 엔진: 목표 위치(target)를 향해 매 프레임 부드럽게 따라가요 --- */
  var W = { run: false, cur: 0, target: 0, last: 0, start: 0, gesture: false, raf: 0, timer: 0 };
  function wheelFrame(now) {
    var dt = Math.min(50, now - W.last); W.last = now;
    var diff = W.target - W.cur;
    if (Math.abs(diff) < 0.5) { W.cur = W.target; window.scrollTo(0, W.cur); W.run = false; return; }
    W.cur += diff * (1 - Math.exp(-dt / TAU));
    window.scrollTo(0, W.cur);
    W.raf = requestAnimationFrame(wheelFrame);
  }
  function startWheel() { if (W.run) return; W.run = true; W.last = performance.now(); W.raf = requestAnimationFrame(wheelFrame); }
  function stopWheel() { if (W.run) cancelAnimationFrame(W.raf); W.run = false; W.gesture = false; clearTimeout(W.timer); }

  function snapPoints() {
    var vh = window.innerHeight, y = window.pageYOffset, max = maxScrollY(), pts = [0, max];
    secs.forEach(function (el) {
      var r = el.getBoundingClientRect(), top = r.top + y;
      pts.push(Math.min(max, Math.max(0, top)));
      if (r.height > vh + 4) pts.push(Math.min(max, Math.max(0, top + r.height - vh)));   // 긴 섹션은 아래 끝도 맞춤 위치
    });
    pts.sort(function (a, b) { return a - b; });
    var out = [];
    pts.forEach(function (v) { if (!out.length || v - out[out.length - 1] > 2) out.push(v); });
    return out;
  }
  function settle() {
    W.gesture = false;
    var vh = window.innerHeight, pts = snapPoints(), end = W.target, start = W.start, i;
    // 아주 긴 섹션의 한가운데에서 멈췄다면 그 자리에 둬요
    var free = false;
    secs.forEach(function (el) {
      var r = el.getBoundingClientRect(), top = r.top + window.pageYOffset;
      if (r.height > vh + 4 && end > top + vh * 0.3 && end < top + r.height - vh - vh * 0.3) free = true;
    });
    if (free) return;
    var near = pts[0];
    pts.forEach(function (p) { if (Math.abs(p - end) < Math.abs(near - end)) near = p; });
    var s = near;
    // 휠을 조금만 굴려도 굴린 방향의 다음 위치로 넘어가게 해요 (제자리로 되돌아가지 않도록)
    if (end > start + 1 && s <= start + 4) { for (i = 0; i < pts.length; i++) if (pts[i] > start + 4) { s = pts[i]; break; } }
    else if (end < start - 1 && s >= start - 4) { for (i = pts.length - 1; i >= 0; i--) if (pts[i] < start - 4) { s = pts[i]; break; } }
    W.target = s; startWheel();
  }

  /* --- 키보드·터치·버튼: 정해진 시간 동안 부드럽게 이동 --- */
  function cancelAnim() {
    if (!anim) return;
    cancelAnimationFrame(anim.raf); anim = null;
  }
  function animateTo(y) {
    var start = window.pageYOffset, dist = y - start;
    if (Math.abs(dist) < 2) return false;
    cancelAnim(); stopWheel();
    var t0 = performance.now(), me = anim = { raf: 0 };
    (function step(now) {
      var p = Math.min(1, (now - t0) / DUR);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) { me.raf = requestAnimationFrame(step); }
      else { if (anim === me) anim = null; }
    })(t0);
    return true;
  }
  function pageStep(dir) {
    var vh = window.innerHeight, y = window.pageYOffset;
    var maxY = maxScrollY();
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

  {
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;
      if (FREE && !overlayOpen()) return;                          // 확대/축소는 그대로 (자연 스크롤 모드에서는 브라우저 기본 동작)
      if (overlayOpen()) { e.preventDefault(); return; }
      var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (Math.abs(e.deltaX) > Math.abs(dy) * 2 && Math.abs(e.deltaX) > 12) return;   // 확실한 가로 스와이프만 제외
      e.preventDefault();
      if (!dy) return;
      if (anim) cancelAnim();                                  // 키보드·터치 이동 중이면 그 자리에서 이어받아요
      if (!W.gesture) {                                        // 새로 굴리기 시작
        W.start = W.run ? W.target : window.pageYOffset;
        if (!W.run) { W.cur = window.pageYOffset; W.target = W.cur; }
        W.gesture = true;
      }
      W.target = Math.min(maxScrollY(), Math.max(0, W.target + dy));
      startWheel();
      clearTimeout(W.timer); W.timer = setTimeout(settle, SETTLE_IDLE);
    }, { passive: false });

    window.addEventListener("keydown", function (e) {
      if (FREE || overlayOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target || {};
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      var dir = 0, k = e.key;
      if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey && !/^(BUTTON|A)$/.test(t.tagName))) dir = 1;
      else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) dir = -1;
      else if (k === "Home") { e.preventDefault(); animateTo(0); return; }
      else if (k === "End") { e.preventDefault(); animateTo(maxScrollY()); return; }
      if (!dir) return;
      e.preventDefault();
      if (!anim) pageStep(dir);
    });
    // 스크롤바를 직접 잡아 끌 때는 자동 이동을 멈춰요
    window.addEventListener("mousedown", function (e) { if (e.target === root) { cancelAnim(); stopWheel(); } });
  }

  /* 휴대폰 터치: 위/아래로 쓸어넘기면 한 섹션씩 부드럽게 이동해요 */
  var tY = 0, tX = 0, tT = 0, tTrack = false, tMoved = false;
  window.addEventListener("touchstart", function (e) {
    if (FREE || overlayOpen() || e.touches.length > 1) { tTrack = false; return; }
    tTrack = true; tMoved = false;
    tY = e.touches[0].clientY; tX = e.touches[0].clientX; tT = performance.now();
  }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (!tTrack) return;
    if (e.touches.length > 1) { tTrack = false; return; }
    var dy = tY - e.touches[0].clientY, dx = tX - e.touches[0].clientX;
    if (!tMoved) {
      if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;
      if (Math.abs(dx) > Math.abs(dy)) { tTrack = false; return; }   // 가로 움직임은 건드리지 않아요
      tMoved = true;
    }
    if (e.cancelable) e.preventDefault();                           // 기본 스크롤을 막고 아래에서 직접 이동
  }, { passive: false });
  window.addEventListener("touchend", function (e) {
    if (!tTrack || !tMoved) { tTrack = false; return; }
    tTrack = false;
    var dy = tY - e.changedTouches[0].clientY, now = performance.now();
    var speed = Math.abs(dy) / Math.max(1, now - tT);
    if (anim || now < lockUntil) return;
    if (Math.abs(dy) > 40 || (Math.abs(dy) > 15 && speed > 0.35)) {
      if (pageStep(dy > 0 ? 1 : -1)) lockUntil = now + DUR + 80;
    }
  }, { passive: true });


  /* ---------- 오프닝: Welcome 글씨 → 커버 사진 ---------- */
  (function () {
    var cover = $("#cover"), I = C.intro;
    function go() { cover.classList.add("go"); }
    if (I === false) { go(); return; }
    I = I || {};
    var ov = document.createElement("div");
    ov.id = "intro"; ov.className = "intro";
    ov.innerHTML = '<div class="intro-text">' + scriptLines((I.line1 || "Welcome") + "|" + (I.line2 || "to our wedding"), 0.3) + "</div>";
    document.body.appendChild(ov);
    root.classList.add("intro-lock");
    var done = false;
    function finish() {
      if (done) return; done = true;
      ov.classList.add("out");
      root.classList.remove("intro-lock");
      setTimeout(go, 350);
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 1300);
    }
    ov.addEventListener("click", finish);
    setTimeout(finish, 3900);
  })();

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
