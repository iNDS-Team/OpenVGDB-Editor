<?php
  $found = false;
  if (isset($_GET['id']) && isset($_GET['md5']) && isset($_GET['sha1']) && isset($_GET['crc']) && isset($_GET['size'])) {
    $pdo = new PDO("sqlite:openvgdb.sqlite");
    $sth = $pdo->prepare("SELECT 1 FROM ROMs WHERE UPPER(romHashMD5) = UPPER(?) OR UPPER(romHashCRC) = UPPER(?) OR UPPER(romHashSHA1) = UPPER(?)");
    $sth->execute(array($_GET['md5'], $_GET['crc'], $_GET['sha1']));
    $result = $sth->fetchAll(\PDO::FETCH_ASSOC);
    if (count($result) == 0) {
      $sth = $pdo->prepare("SELECT * FROM ROMs WHERE romID = ?");
      $sth->execute(array($_GET['id']));
      $old = $sth->fetch();

      $sth = $pdo->prepare("INSERT INTO ROMs (systemID, regionID, romHashCRC, 
      romHashMD5, romHashSHA1, romSize, romFileName, romExtensionlessFileName, 
      romSerial, romHeader, romLanguage, TEMPromRegion, romDumpSource) VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      $sth->execute(array($old['systemID'], $old['regionID'], $_GET['crc'], 
      $_GET['md5'], $_GET['sha1'], $_GET['size'],
      $old['romFileName'], $old['romExtensionlessFileName'], $old['romSerial'],
      $old['romHeader'], $old['romLanguage'], $old['TEMPromRegion'],
      $old['romDumpSource']));
      $result = $pdo->lastInsertId();
      
      $sth = $pdo->prepare("SELECT * FROM RELEASES WHERE romID = ?");
      $sth->execute(array($_GET['id']));
      $old = $sth->fetch();

      $sth = $pdo->prepare("INSERT INTO RELEASES (romID, releaseTitleName,
      regionLocalizedID,
      TEMPregionLocalizedName, TEMPsystemShortName, TEMPsystemName,
      releaseCoverFront, releaseCoverBack, releaseCoverCart, releaseCoverDisc,
      releaseDescription, releaseDeveloper, releasePublisher, releaseGenre,
      releaseDate, releaseReferenceURL, releaseReferenceImageURL) VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      $sth->execute(array($result, $old['releaseTitleName'],
      $old['regionLocalizedID'],
      $old['TEMPregionLocalizedName'], $old['TEMPsystemShortName'],
      $old['TEMPsystemName'], $old['releaseCoverFront'],
      $old['releaseCoverBack'], $old['releaseCoverCart'],
      $old['releaseCoverDisc'], $old['releaseDescription'],
      $old['releaseDeveloper'], $old['releasePublisher'], $old['releaseGenre'],
      $old['releaseDate'], $old['releaseReferenceURL'],
      $old['releaseReferenceImageURL']));
      header('Location: index.php?success');
    } else {
      $found = true;
    }
  } elseif (!isset($_GET['id'])) {
    echo "No Game Specified";
    exit;
  }
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>OpenVGDB Editor</title>
    <link rel="stylesheet" href="index.css">
  </head>
  <body>
    
    <div id="drop-area">
    <div class="container">
      <h1>Drag and Drop ROM Here</h1>
      <p>Or browse for the ROM</p>
      <input type="file" name="file" id="file">
      <br />
      <button id="submit" disabled="disabled">Submit</button>
      <br />
      <div class="lds-dual-ring" id="loading" style="opacity: 0;"></div>
      
</div>
    </div>
    <?php if ($found) { echo '<div class="badbanner">This ROM already exists.</div>'; } ?>
    <script src="crypto-js/crypto-js.js"></script>
    <script src="crc.min.js"></script>
    <script src="polyfill.min.js"></script>
    <script src="upload.js"></script>
  </body>
</html>
