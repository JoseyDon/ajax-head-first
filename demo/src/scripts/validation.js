window.onload = initPage;
function initPage(){
	document.getElementById('username').onblur =
	checkUsername;
}

function checkUsername(){
	request = createRequest();
	if (request == null) {
		alert("不能创建请求对象");
	}
	else{
		var theName = document.getElementById("username").value;
		var username = escape(theName);
		var url = "checkName.php?username="+username;
		request.onreadystatechange = showUsernameStatus;
		request.open("GET",url,true);
		request.send(null);
	}
}

function showUsernameStatus(){
	if (request.readyState == 4) {
		if (request.status == 200) {
			if (request.responseText == "okay") {
				成功;
			}
			else{
				alert("用户名已经被注册了");
			}
		}
	}
}