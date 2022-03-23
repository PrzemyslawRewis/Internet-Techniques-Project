<?php


class db {
    private $user = "9rewis" ;
    private $pass = "pass9rewis";
    private $host = "172.20.44.25";
    private $base = "9rewis";
    private $coll = "uzytkownik";
    private $coll_ankieta = "ankieta";
    private $conn;
    private $dbase;
    private $collection;
    private $collection_a;



    function __construct() {
      $this->conn = new MongoDB\Client("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}");    
      $this->collection = $this->conn->{$this->base}->{$this->coll};
      $this->collection_a = $this->conn->{$this->base}->{$this->coll_ankieta};
      session_start();
    }

    function select() {
      $cursor = $this->collection->find();
      $table = iterator_to_array($cursor);
      return $table ;
    }
    function login($user) {
      $criteria = array(
        'email' => $user['email'], 'pass'  => $user['pass']);
      $doc = $this->collection->findOne($criteria);
      
      if (empty($doc)) {
         return false;
      } 
      else{
         $session_id = md5(uniqid($user['email'], true));
         $_SESSION['id'] = $session_id;
        return $_SESSION['id'];
      }
    }

    function logout() {
        if(isset($_SESSION))
        {
          unset($_SESSION);
           session_destroy();
           return true;
        }
        return false;
        
    }
    

    function insert($user) {
      $ret = $this->collection->insertOne($user) ;
      return $ret;
    }
    function insert2($ans) {
      $ret = $this->collection_a->insertOne($ans) ;
      return $ret;
    }
    function answer_get(){
      $cursor = $this->collection_a->find();
      $table = iterator_to_array($cursor);
      return $table ;
    }


    function update($ident,$user,$flag) {
      if ( $flag ) {
         $rec = new MongoDB\BSON\ObjectId($ident);
         $filter = array ( '_id' => $rec );
      } else {
         $filter = array ( 'ident' => $ident );
      }
      $update = array ( '$set' => $user );
      $updresult = $this->collection->updateOne($filter,$update);
      $ret = $updresult->getModifiedCount();
      return $ret;
    }
    private function _getansw(){	
      if($this->get_request_method() != "GET"){
        $this->response('',406);
      }
      
     $res = $this->db->answer_get(); 
      if ( $res ) {
        $result = array('return'=>'ok', 'res' => $res);
        $this->response($this->json($result), 200);
      } else {
        $result = array('return'=>'not found');
        $this->response($this->json($result), 200);
      }   
            
      $this->response($this->json($result), 200); 
           $this->response('',204);
    }

    function delete($ident,$flag) {
      if ( $flag ) {
         $rec = new MongoDB\BSON\ObjectId($ident);
         $filter = array ( '_id' => $rec );
      } else {
         $filter = array ( 'ident' => $ident );
      }
      $delresult = $this->collection->deleteOne($filter);
      $ret = $delresult->getDeletedCount(); 
      return $ret;
    }
}