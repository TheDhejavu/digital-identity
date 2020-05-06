module.exports.isJson = (data)=> {
    try {
      JSON.parse(data)
      return true;
    }catch(e){
      return false;
    }
}