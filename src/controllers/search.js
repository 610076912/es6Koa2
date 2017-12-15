class Search {
	constructor (x, y) {
		this.x = x
		this.y = y
	}
	foo () {
		return this.x + this.y
	}
}

export default new Search(10, 13)