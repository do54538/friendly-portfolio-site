// 各面に表示する自己紹介データ
//ここにcsvを読み込む処理を追加するが、現状だと日本語が読み込まれない
fetch("./intro.csv")
  .then(response => response.text())
  .then(function(data) {

      var rows = data.trim().split("\n");
      var headers = rows[0].split(",");

      var faces = rows.slice(1).map(function(row) {
          var values = row.split(",");
          var work = {};
          headers.forEach(function(header, index) {
              work[header] = values[index];
          });
          return work;
    });


    // 天気用API
    var latitude = 35.6895;
    var longitude = 139.6917;

    var weatherUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + latitude +
      "&longitude=" + longitude +
      "&current=temperature_2m,weather_code" +
      "&timezone=Asia/Tokyo";

    fetch(weatherUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        var weatherCode = data.current.weather_code;
        showWeather(weatherCode);
      });

    function showWeather(code) {
      var icon = document.getElementById("weather-icon");

      if (code === 0) {
        icon.textContent = "☀️";
        document.body.className = "weather-sunny";

      } else if (code >= 1 && code <= 3) {
        icon.textContent = "⛅";
        document.body.className = "weather-cloudy";

      } else if (code >= 51 && code <= 67) {
        icon.textContent = "☔";
        document.body.className = "weather-rainy";

      } else {
        icon.textContent = "⛅";
        document.body.className = "weather-cloudy";
      }
    }

    const cube = document.querySelector('#cube');
    const stage = document.querySelector('#stage');

    let rotation = { x: -12, y: -20 };

    //速度変更はこちらから
    let velocity = { x: 0.5, y: 0.5 };

    //回転にかかわるpointer
    let pointer = null;
    let playing = true;

    //csvから読み込み格納する
    //ここに画像を読み込ませる？
    cube.innerHTML = faces.map((face, i) => `
      <article class="face">
        <div class="face-top">
          <span>${face.label}</span>
        </div>

        <div>
          <h3>${face.title}</h3>
            <p class="sub">${face.sub}</p>
            <p class="body">${face.body}</p>
        </div>
        
        <div class="face-foot">
          <span>0${i + 1} / 06</span>
        </div>

      </article>
    `).join('');

    function animate() {
      if (playing && !pointer) {
        velocity.x *= 1;
        velocity.y *= 1;
        if (Math.abs(velocity.x) < 0.12) velocity.x *= 0.9;
        if (Math.abs(velocity.y) < 0.12) velocity.y += (0.12 - velocity.y) * 0.035;
        rotation.x += velocity.x;
        rotation.y += velocity.y;
      }
      cube.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
      requestAnimationFrame(animate);
    }


    stage.addEventListener('pointerdown', (event) => {
      stage.setPointerCapture(event.pointerId);
      pointer = { x: event.clientX, y: event.clientY, t: performance.now() };
      stage.classList.add('fast');
    });


    stage.addEventListener('pointermove', (event) => {
      if (!pointer) return;
      const now = performance.now();
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const dt = Math.max(now - pointer.t, 8);
      rotation.x -= dy * 1.35;
      rotation.y += dx * 1.35;
      velocity = { x: (-dy / dt) * 24, y: (dx / dt) * 24 };
      pointer = { x: event.clientX, y: event.clientY, t: now };
    });


    function release() {
      pointer = null;
      stage.classList.remove('fast');
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);

    animate();
  });
