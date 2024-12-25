function getArticleReadtime(articleText) {
  //split articel text to get array of words in article
  const wordsInArticle = articleText.split(' ')

  //get the length of wordsInArticle array to get number of words in article
  const articleWordCount = wordsInArticle.length

  //declare a variable that specify reading speed
  //(i.e the average number words the reader reads per minute)
  const wordPerMinute = 200

  //divide article word count by word by words read per minute
  //to get average time to read the article
  const averageReadTime = Math.ceil(articleWordCount / wordPerMinute)
  return averageReadTime
}

module.exports = getArticleReadtime
