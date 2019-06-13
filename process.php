<?php

$pdo = new PDO("sqlite:openvgdb.sqlite");
$sth = $pdo->prepare("DELETE FROM ROMs WHERE systemID != 24");
$sth->execute();

$sth = $pdo->prepare("DELETE FROM RELEASES WHERE romID not in (SELECT romID FROM ROMs)");
$sth->execute();

$sth = $pdo->prepare("vacuum");
$sth->execute();


print_r($results);

?>