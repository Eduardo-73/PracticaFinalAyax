<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require 'Firebase/autoload.php';

define("PASSWORD_API","Una_clave_para_usar_para_encriptar");
define("TIEMPO_MINUTOS_API",60);
define("SERVIDOR_BD","localhost");
define("USUARIO_BD","jose");
define("CLAVE_BD","josefa");
define("NOMBRE_BD","bd_libreria_exam");


function validateToken()
{
    
    $headers = apache_request_headers();
    if(!isset($headers["Authorization"]))
        return false;//Sin autorizacion
    else
    {
        $authorization = $headers["Authorization"];
        $authorizationArray=explode(" ",$authorization);
        $token=$authorizationArray[1];
        try{
            $info=JWT::decode($token,new Key(PASSWORD_API,'HS256'));
        }
        catch(\Throwable $th){
            return false;//Expirado
        }

        try{
            $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
        }
        catch(PDOException $e){
            
            $respuesta["error"]="Imposible conectar:".$e->getMessage();
            return $respuesta;
        }

        try{
            $consulta="select * from usuarios where id_usuario=?";
            $sentencia=$conexion->prepare($consulta);
            $sentencia->execute([$info->data]);
        }
        catch(PDOException $e){
            $respuesta["error"]="Imposible realizar la consulta:".$e->getMessage();
            $sentencia=null;
            $conexion=null;
            return $respuesta;
        }
        if($sentencia->rowCount()>0)
        {
            $respuesta["usuario"]=$sentencia->fetch(PDO::FETCH_ASSOC);
         
            $payload['exp']=time()+TIEMPO_MINUTOS_API*60;
            $payload['data']= $respuesta["usuario"]["id_usuario"];
            $jwt = JWT::encode($payload,PASSWORD_API,'HS256');
            $respuesta["token"]=$jwt;
        }
            
        else
            $respuesta["mensaje_baneo"]="El usuario no se encuentra registrado en la BD";

        $sentencia=null;
        $conexion=null;
        return $respuesta;
    }
    
}

function login($datos_login)
{
    try{
        $conexion=new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
    }
    catch(PDOException $e)
    {
        $respuesta["error"]="No he podido conectarse a la base de batos: ".$e->getMessage();
        return $respuesta;
    }

    try{
        $consulta="select * from usuarios where lector=? and clave=?";
        $sentencia=$conexion->prepare($consulta);
        $sentencia->execute($datos_login);

    }
    catch(PDOException $e)
    {
        $sentencia=null;
        $conexion=null;
        $respuesta["error"]="No he podido realizarse la consulta: ".$e->getMessage();
        return $respuesta;
    }

    if($sentencia->rowCount()>0)
    {
        $respuesta["usuario"]=$sentencia->fetch(PDO::FETCH_ASSOC);
        $payload['exp']=time()+TIEMPO_MINUTOS_API*60;
        $payload['data']= $respuesta["usuario"]["id_usuario"];
        $jwt = JWT::encode($payload,PASSWORD_API,'HS256');
        $respuesta["token"]=$jwt;

    }
    else
        $respuesta["mensaje"]="El usuario no se encuentra en la BD";
    
    $sentencia=null;
    $conexion=null;
    return $respuesta;
}

function obtener_libros()
{
    try{
        $conexion=new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
    }
    catch(PDOException $e)
    {
        $respuesta["error"]="No he podido conectarse a la base de batos: ".$e->getMessage();
        return $respuesta;
    }

    try{
        $consulta="select * from libros";
        $sentencia=$conexion->prepare($consulta);
        $sentencia->execute();

    }
    catch(PDOException $e)
    {
        $sentencia=null;
        $conexion=null;
        $respuesta["error"]="No he podido realizarse la consulta: ".$e->getMessage();
        return $respuesta;
    }

    $respuesta["libros"]=$sentencia->fetchAll(PDO::FETCH_ASSOC);
        
    $sentencia=null;
    $conexion=null;
    return $respuesta;
}

?>