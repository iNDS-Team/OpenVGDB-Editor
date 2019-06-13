<?php
    $pdo = new PDO("sqlite:openvgdb.sqlite");
    $sth = $pdo->prepare("SELECT 1 FROM ROMs WHERE UPPER(romHashMD5) = UPPER(?)");
    $sth->execute();
    $result = $sth->fetchAll(\PDO::FETCH_ASSOC);
    echo print_r($result);
?>