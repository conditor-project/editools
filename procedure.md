## Procédure de creation des corpus de données pour la chaine d'ingestion de Conditor

- Extraction des fichier xml TEI :
  - depuis l'API HAL à l'aide du script conditor.php
  - depuis l'API de Pubmed à l'aide du script pubmed-collector.js

- Transformation des fichiers xml en TEI Conditor

```bash
find nomDuRepertoireAvecLesXML -name "*.xml" | parallel --jobs 4 "xsltproc -o nomduRepertoireTeiConditor --stringparam DateAcqu MettreDateAcquisition --stringparam DateCreat MettreDatedeCreation cheminVersLaFeuilleDeStyleXLST {}"
```

Example : 
```bash
find hal-2015 -name "*.xml" | parallel --jobs 4 "xsltproc -o tei-conditor/{} --stringparam DateAcqu 06/03/2019 --stringparam DateCreat 06/03/2019 ~/Dev/conditor/tei-conditor/src/source/hal/HAL2Conditor_TEI0.xsl {}"
```

- Mettre à plat tous les fichiers xml dans son repertoire avant compression dans un fichier zip

```bash
cd nomduRepertoireTeiConditor
find . -name "*.xml" -exec mv {} . \;
find . -type d -delete
```

- Compresser tous les fichiers dans une archive zip

```bash
find . -name "*.xml" | zip source-tei-conditor-2014.zip -@
```


Annexe : 
Librairie hal-stream.js pour moissonner HAL en NodeJS