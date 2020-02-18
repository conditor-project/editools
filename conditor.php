<?php
/**
 * Created by PhpStorm.
 * User: yannick
 * Date: 20/10/2017
 * Time: 10:52
 * up-date by valerie bonvallot
 */

set_time_limit(0);

$API_ENDPOINT = 'https://api.archives-ouvertes.fr/search/?';

$DIR = '/Users/yannick/Documents/conditor/hal-2014/';


$query = ['wt' => 'json', 'q' => 'structCountry_s:(fr%20OR%20gf%20OR%20gp%20OR%20mq%20OR%20re%20OR%20yt%20OR%20bl%20OR%20mf%20OR%20pf%20OR%20pm%20OR%20wf%20OR%20nc)', 'fq' => 'producedDateY_i:2014', 'fl' => 'docid,halId_s,label_xml', 'sort' => 'docid+desc', 'rows' => '1000', 'cursorMark' => '*'];

while (true)
{
    $q = [];
    foreach ( $query as $p=>$v) {
        $q[] = $p . '=' . $v;
    }
    print 'cursor : ' . $query['cursorMark'] . "\n";

    $url = $API_ENDPOINT . implode('&', $q);

    $s = curl_init();
    curl_setopt ( $s, CURLOPT_URL, $url );
    curl_setopt($s,CURLOPT_RETURNTRANSFER,true);
    $info = curl_exec ( $s );
    if (curl_errno ( $s ) != CURLE_OK) {
        exit(curl_errno( $s ));
    }
    $result = json_decode($info);
    if (count($result->response->docs) == 0) {
        exit('Fin du script');
    }

    foreach ($result->response->docs as $tei) {
        saveFile($tei->label_xml, $DIR, $tei->docid, $tei->halId_s);
    }

    if (!$result->nextCursorMark) {
        var_dump($info);
        exit;
    }

    $query['cursorMark'] = rawurlencode($result->nextCursorMark);
}

function saveFile($content, $directory, $docid, $identifier)
{
    $directory .= substr(wordwrap(sprintf("%08d", $docid), 2, DIRECTORY_SEPARATOR, 1), 0, 5) . DIRECTORY_SEPARATOR;
    if (! is_dir($directory)) {
        mkdir($directory, 0777, true);
    }
    $filename = $identifier . '.xml';

    file_put_contents($directory . $filename, $content);
}
