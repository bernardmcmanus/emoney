var stack,
  index = 0,
  length = 0,
  inprog = false;

export default stack = Object.create({
  /* jshint -W033 */
  get index(){ return index },
  get length(){ return length },
  get inprog(){ return inprog },
  digest: function( fn ){
    stack.enqueue( fn );
    stack.flush();
  },
  enqueue: function( fn ){
    stack[length] = fn;
    length++;
  },
  flush: function(){
    var fn, caught;
    if (!inprog) {
      inprog = true;
      /* jshint -W084 */
      while (fn = next()) {
        try {
          fn();
        }
        catch( err ){
          caught = err;
          empty();
          break;
        }
      }
      inprog = false;
      if (caught) {
        throw caught;
      }
    }
  }
});

function drop(){
  delete stack[index];
}

function empty(){
  index = length;
  while (index > 0) {
    index--;
    drop();
  }
  length = index = 0;
}

function next(){
  var fn = stack[index];
  drop();
  index++;
  if (index >= length) {
    empty();
  }
  return fn;
}
