<?php
$conn = mysql_connect("localhost", "user", "pass");
$result = mysql_query("SELECT * FROM users");
$row = mysql_fetch_array($result);
var $name = "John";
echo $name;
session_register("username");
ereg("pattern", $string);
split(",", $string);
?>