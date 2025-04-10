var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_xformMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

// Thêm các biến để lưu trạng thái quay cho từng xúc xắc
let goc1 = 0, goc2 = 0, goc3 = 0;
let x1 = 1, y1 = 1, z1 = 1;
let x2 = 1, y2 = 1, z2 = 1;
let x3 = 1, y3 = 1, z3 = 1;
let time1 = 0, time2 = 0, time3 = 0;
let invert1 = 1, invert2 = 1, invert3 = 1;

// Thêm biến toàn cục để lưu kết quả các xúc xắc

let userBet = null; // 'tai' hoặc 'xiu'
let diceResults = [0, 0, 0];
let currentFaces = [0, 0, 0]; // 0-5 tương ứng các mặt 1-6


function main() {
  var image1 = new Image();
  image1.src = 'mat3new.gif';
  var image2 = new Image();
  image2.src = 'mat1new.gif';
  var image3 = new Image();
  image3.src = 'mat5new.gif';
  var image4 = new Image();
  image4.src = 'mat6new.gif';
  var image5 = new Image();
  image5.src = 'mat2new.gif';
  var image6 = new Image();
  image6.src = 'mat4new.gif';

  var images = [image1, image2, image3, image4, image5, image6];
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  
    // Thêm sự kiện cho nút Tài/Xỉu
    document.getElementById('tai-btn').onclick = function() {
        userBet = 'tai';
        document.getElementById('tai-btn').classList.add('selected');
        document.getElementById('xiu-btn').classList.remove('selected');
        document.getElementById('user-choice').innerHTML = "Bạn đã chọn: <strong>TÀI</strong>";
    };

    document.getElementById('xiu-btn').onclick = function() {
        userBet = 'xiu';
        document.getElementById('xiu-btn').classList.add('selected');
        document.getElementById('tai-btn').classList.remove('selected');
        document.getElementById('user-choice').innerHTML = "Bạn đã chọn: <strong>XỈU</strong>";
    };

  // Điều chỉnh kích thước viewport để phù hợp với canvas
  gl.viewport(0, 0, canvas.width, canvas.height);
  
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  var n = initVertexBuffers(gl);

  
  var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  var xformMatrix = new Matrix4();
  xformMatrix.setIdentity();
  // Điều chỉnh ma trận ortho để phù hợp với canvas 600x600
  // Tỉ lệ width/height = 1 (canvas vuông) nên giữ nguyên tỉ lệ
  xformMatrix.ortho(-2.0, 2.0, -1.5, 1.5, -10.0, 10.0);
  xformMatrix.lookAt(0, 0, 0, 0, 0, -1, 0, 1, 0);
  
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var texture = [];
  for (var i = 0; i < 6; i++) {
    texture[i] = gl.createTexture();
  }

  function drawDice(gl, n, textures, positionMatrix, rotationMatrix, u_xformMatrix) {
    var finalMatrix = new Matrix4();
    finalMatrix.set(xformMatrix); // Ma trận chiếu
    
    // Thêm ma trận scale để thu nhỏ xúc xắc
    var scaleMatrix = new Matrix4();
    scaleMatrix.setScale(0.5, 0.5, 0.5); // Giảm kích thước còn 50%
    
    finalMatrix.multiply(positionMatrix); // Vị trí
    finalMatrix.multiply(rotationMatrix); // Quay
    finalMatrix.multiply(scaleMatrix); // Scale
    
    gl.uniformMatrix4fv(u_xformMatrix, false, finalMatrix.elements);
    for (let i = 0; i < 6; i++) {
      gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4);
    }
  }
  
  // Ma trận vị trí cho 3 con xúc xắc với khoảng cách đều nhau

  const dice1Pos = new Matrix4();
  dice1Pos.setTranslate(-0.5, 0.2, 0); // Xúc xắc trái

  const dice2Pos = new Matrix4();
  dice2Pos.setTranslate(0, -0.5, 0); // Xúc xắc giữa

  const dice3Pos = new Matrix4();
  dice3Pos.setTranslate(0.5, 0.2, 0); // Xúc xắc phải  

  // Tạo ma trận quay riêng cho từng xúc xắc
  const rotationMatrix1 = new Matrix4();
  const rotationMatrix2 = new Matrix4();
  const rotationMatrix3 = new Matrix4();
  let loadedCount = 0;

  for (let i = 0; i < 6; i++) {
    images[i].onload = function () {
      loadTexture(gl, n, texture[i], gl.getUniformLocation(gl.program, 'u_Sampler'), images[i], i);
      loadedCount++;
      if (loadedCount === 6) {
        drawAllDice();
      }
    };    
  }

  // Sửa hàm drawAllDice để sử dụng ma trận quay riêng
  function drawAllDice() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawDice(gl, n, texture, dice1Pos, rotationMatrix1, u_xformMatrix);
    drawDice(gl, n, texture, dice2Pos, rotationMatrix2, u_xformMatrix);
    drawDice(gl, n, texture, dice3Pos, rotationMatrix3, u_xformMatrix);
  }

  var flag = true;
  var time = 0;

  // Button to start rotation
  var btnXoay = document.getElementById('tam');
  btnXoay.onclick = function () {
    flag = true;
  
    // Khởi tạo giá trị ngẫu nhiên ban đầu cho mỗi xúc xắc
    goc1 = Math.random() * 360;
    goc2 = Math.random() * 360;
    goc3 = Math.random() * 360;
    time1 = Math.random() * 10;
    time2 = Math.random() * 10;
    time3 = Math.random() * 10;   

    var resultElement = document.getElementById('result');
  var taiXiuElement = document.getElementById('taiXiu');

  resultElement.innerHTML = "";
  taiXiuElement.innerHTML = ""

     
    function animate() {
      // Cập nhật góc quay và trục quay ngẫu nhiên cho từng xúc xắc
      updateDiceRotation(1);
      updateDiceRotation(2);
      updateDiceRotation(3);
      
      // Áp dụng phép quay cho từng xúc xắc
      rotationMatrix1.setRotate(goc1, x1, y1, z1);
      rotationMatrix2.setRotate(goc2, x2, y2, z2);
      rotationMatrix3.setRotate(goc3, x3, y3, z3);
      
      if (flag) {
        requestAnimationFrame(animate);
      }
      drawAllDice();
    }
    animate();  
  };

  // Hàm cập nhật góc quay ngẫu nhiên cho từng xúc xắc
  function updateDiceRotation(diceNum) {
    let goc, time, invert;
    let x, y, z;
    
    if (diceNum === 1) {
        goc = goc1; time = time1; invert = invert1;
    } else if (diceNum === 2) {
        goc = goc2; time = time2; invert = invert2;
    } else {
        goc = goc3; time = time3; invert = invert3;
    }

    // Chọn mặt mới không trùng với mặt hiện tại
    let nextFace;
    do {
        nextFace = Math.floor(Math.random() * 6); // 0-5
    } 
    while (nextFace === currentFaces[diceNum-1]);
    
    currentFaces[diceNum-1] = nextFace;
    
    // Cập nhật trục quay ngẫu nhiên nhưng ưu tiên trục chính
    const mainAxis = Math.floor(Math.random() * 3); // 0:x, 1:y, 2:z
    x = mainAxis === 0 ? 3 : Math.random() * 0.3;
    y = mainAxis === 1 ? 3 : Math.random() * 0.3;
    z = mainAxis === 2 ? 3 : Math.random() * 0.3;
    
    // Chuẩn hóa vector
    const length = Math.sqrt(x*x + y*y + z*z);
    x /= length; y /= length; z /= length;
    
    // Cập nhật lại giá trị
    if (diceNum === 1) {
        goc1 = goc * 2; x1 = x; y1 = y; z1 = z;
    } else if (diceNum === 2) {
        goc2 = goc * 2; x2 = x; y2 = y; z2 = z;
    } else {
        goc3 = goc * 2; x3 = x; y3 = y; z3 = z;
    }
  }
  // Button to stop rotation
  var btnDung = document.getElementById('dung');
  btnDung.onclick = function() {
    if (!userBet) {
        alert("Vui lòng chọn Tài hoặc Xỉu trước khi dừng!");
        return;
    }

    flag = false;
    
    // Kiểm tra kết quả từng xúc xắc
    diceResults[0] = checkTexture(rotationMatrix1);
    diceResults[1] = checkTexture(rotationMatrix2);
    diceResults[2] = checkTexture(rotationMatrix3);
  };

  var btnKqua = document.getElementById('kqua')
  btnKqua.onclick = function(){
    if (!userBet) {
      alert("Vui lòng chọn Tài hoặc Xỉu trước khi dừng!");
      return;
    }

  flag = false;
  
  
  // Kiểm tra kết quả từng xúc xắc
  diceResults[0] = checkTexture(rotationMatrix1);
  diceResults[1] = checkTexture(rotationMatrix2);
  diceResults[2] = checkTexture(rotationMatrix3);
  
  var total = diceResults[0] + diceResults[1] + diceResults[2];
  var resultElement = document.getElementById('result');
  var taiXiuElement = document.getElementById('taiXiu');
  
  // Hiển thị kết quả từng xúc xắc và tổng
  resultElement.innerHTML = `Kết quả: ${diceResults[0]} + ${diceResults[1]} + ${diceResults[2]} = ${total}`;
  
  // Xác định Tài/Xỉu
  let isTai = total > 10;
  
  if (isTai) {
      taiXiuElement.innerHTML = "TÀI";
      taiXiuElement.style.color = "green";
  } else {
      taiXiuElement.innerHTML = "XỈU";
      taiXiuElement.style.color = "red";
  }
  // Kiểm tra kết quả đặt cược
    if ((isTai && userBet === 'tai') || (!isTai && userBet === 'xiu')) {
        alert("Chúc mừng! Bạn đoán đúng!");
    } else {
        alert("Tiếc quá! Bạn đoán sai rồi!");
    }
  
  }
}

// Hàm kiểm tra mặt đối diện sau khi xoay
// Sửa hàm checkTexture để trả về mặt hiện ra của xúc xắc
function checkTexture(xformMatrix) {
    const faceNormals = [
        [0, 0, 1],    // Mặt 1
        [1, 0, 0],     // Mặt 2
        [0, 0, -1],    // Mặt 3
        [-1, 0, 0],    // Mặt 4
        [0, 1, 0],     // Mặt 5
        [0, -1, 0]     // Mặt 6
    ];
    
    const rotationMatrix = [
        [xformMatrix.elements[0], xformMatrix.elements[1], xformMatrix.elements[2]],
        [xformMatrix.elements[4], xformMatrix.elements[5], xformMatrix.elements[6]],
        [xformMatrix.elements[8], xformMatrix.elements[9], xformMatrix.elements[10]]
    ];

  const cameraDir = [0, 0, -1];

  let maxDot = -Infinity;
  let visibleFace = -1;

  for (let i = 0; i < faceNormals.length; i++) {
    const transformedNormal = multiplyMatrixAndVector(rotationMatrix, faceNormals[i]);
    const dot = transformedNormal[0] * cameraDir[0] +
                transformedNormal[1] * cameraDir[1] +
                transformedNormal[2] * cameraDir[2];

    if (dot > maxDot) {
      maxDot = dot;
      visibleFace = i;
    }
  }
  return visibleFace + 1; // Trả về 1-6

}

// Hàm nhân ma trận 3x3 với vectơ 3D
function multiplyMatrixAndVector(matrix, vector) {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
    matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2],
  ];
}

function loadTexture(gl, n, texture, u_Sampler, image, count) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, 0);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    // Front face
    -0.5,  0.5,  0.5, 0.0, 1.0,
    -0.5, -0.5,  0.5, 0.0, 0.0,
    0.5,  0.5,  0.5, 1.0, 1.0,
    0.5, -0.5,  0.5, 1.0, 0.0,

    // Back face
    -0.5,  0.5, -0.5, 0.0, 1.0,
    -0.5, -0.5, -0.5, 0.0, 0.0,
    0.5,  0.5, -0.5, 1.0, 1.0,
    0.5, -0.5, -0.5, 1.0, 0.0,

    // Top face
    -0.5,  0.5,  0.5, 0.0, 1.0,
    -0.5,  0.5, -0.5, 0.0, 0.0,
    0.5,  0.5,  0.5, 1.0, 1.0,
    0.5,  0.5, -0.5, 1.0, 0.0,

    // Bottom face
    -0.5, -0.5,  0.5, 0.0, 1.0,
    -0.5, -0.5, -0.5, 0.0, 0.0,
    0.5, -0.5,  0.5, 1.0, 1.0,
    0.5, -0.5, -0.5, 1.0, 0.0,

    // Right face
    0.5, -0.5,  0.5, 0.0, 0.0,
    0.5, -0.5, -0.5, 1.0, 0.0,
    0.5,  0.5,  0.5, 0.0, 1.0,
    0.5,  0.5, -0.5, 1.0, 1.0,

    // Left face
    -0.5, -0.5,  0.5, 0.0, 1.0,
    -0.5, -0.5, -0.5, 0.0, 0.0,
    -0.5,  0.5,  0.5, 1.0, 1.0,
    -0.5,  0.5, -0.5, 1.0, 0.0,
  ]);
  var n = 24; // The number of vertices
  var FSIZE = vertices.BYTES_PER_ELEMENT;
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_TexCoord);
  return n;
}
