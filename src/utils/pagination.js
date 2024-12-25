function paginationAlgorithm(data, pageNumber = 1, pageSize = 3) {
  console.log(data.length)
  console.log('pageNumber--', pageNumber, 'pageSize--', pageSize)
  const pageCount = Math.ceil(
    data.length / Number(!pageSize ? 3 : pageSize > 3 ? 3 : pageSize)
  )
  const computedPageNumber = Number(
    !pageNumber ? 1 : pageNumber > pageCount ? pageCount : pageNumber
  )

  console.log('computed pageNumber--', computedPageNumber)
  console.log('pageCount--', pageCount)
  const startIndex = (computedPageNumber - 1) * pageSize
  const endIndex = computedPageNumber * pageSize
  console.log('index--', endIndex, startIndex)
  const blogsPerPage = data.slice(startIndex, endIndex)
  return { page: computedPageNumber, pageCount, blogs: blogsPerPage }
}

module.exports = paginationAlgorithm
