<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <!-- KEYS -->
  <xsl:key name="genreById" match="genre" use="@id"/>
  <xsl:key name="domainById" match="applicationDomain" use="@id"/>
  <xsl:key name="sectorById" match="sector" use="@id"/>
  
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <!-- ROOT -->
  <xsl:template match="/catalogue">
    <html>
      <head>
        <title>Serious Games Catalogue</title>
        <meta charset="UTF-8"/>
        <style>
          body {
          font-family: Arial, sans-serif;
          margin: 40px;
          }
          .game {
          border: 1px solid #ccc;
          padding: 15px;
          margin-bottom: 20px;
          }
          .title {
          font-size: 1.3em;
          font-weight: bold;
          }
          img {
          max-width: 200px;
          display: block;
          margin-bottom: 10px;
          border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <h1>Serious Games Catalogue</h1>
        
        <xsl:apply-templates select="games/game">
          <xsl:sort select="rating" data-type="number" order="descending"/>
        </xsl:apply-templates>
        
      </body>
    </html>
  </xsl:template>
  
  <!-- GAME -->
  <xsl:template match="game">
    <div class="game">
      
      <!-- IMAGE -->
      <img src="images/{thumbnail/@source}" />
      
      <div class="title">
        <xsl:value-of select="title"/>
        <xsl:text> (</xsl:text>
        <xsl:value-of select="year"/>
        <xsl:text>)</xsl:text>
      </div>
      
      <p><strong>Description:</strong>
        <xsl:value-of select="description"/>
      </p>
      
      <p><strong>Target audience:</strong>
        <xsl:value-of select="targetAudience"/>
      </p>
      
      <p><strong>Rating:</strong>
        <xsl:value-of select="rating"/>
      </p>
      
      <p><strong>Learning goals:</strong></p>
      <ul>
        <xsl:for-each select="learningGoals/goal">
          <li><xsl:value-of select="."/></li>
        </xsl:for-each>
      </ul>
      
      <p><strong>Genre:</strong>
        <xsl:value-of select="key('genreById', @genre)/name"/>
      </p>
      
      <p><strong>Application domain:</strong>
        <xsl:value-of select="key('domainById', @applicationDomain)/name"/>
      </p>
      
      <p><strong>Sector:</strong>
        <xsl:value-of select="key('sectorById', @sector)/name"/>
      </p>
      
    </div>
  </xsl:template>
  
</xsl:stylesheet>