export default class Stack {
  constructor(){
    var that = this;
    that.index = 0;
    that.length = 0;
    that.inprog = false;
  }
  enqueue( fn ){
    var that = this;
    that[that.length] = fn;
    that.length++;
  }
  empty(){
    this.length = this.index = 0;
  }
  next(){
    var that = this,
      fn = that[that.index];
    delete that[that.index];
    that.index++;
    if (that.index >= that.length) {
      that.empty();
    }
    return fn;
  }
  flush(){
    var that = this,
      fn,
      caught;
    if (!that.inprog) {
      that.inprog = true;
      /* jshint -W084 */
      while (fn = that.next()) {
        try {
          fn();
        }
        catch( err ){
          caught = err;
          that.empty();
        }
      }
      that.inprog = false;
      if (caught) {
        throw caught;
      }
    }
  }
}
