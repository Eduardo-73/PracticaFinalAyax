<?php

require __DIR__ . '/Slim/autoload.php';

require "src/funciones_CTES.php";

$app = new \Slim\App;

$app->get('/logueado', function () {

    $test = validateToken();
    if (is_array($test)) {
        echo json_encode($test);
    } else
        echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
});


$app->post('/login', function ($request) {

    $datos_login[] = $request->getParam("lector");
    $datos_login[] = $request->getParam("clave");


    echo json_encode(login($datos_login));
});

$app->get('/obtenerLibros', function () {

    echo json_encode(obtener_libros());
});

$app->post('/crearLibro', function ($request) {

    $test = validateToken();
    if (is_array($test)) {
        if (isset($test["usuario"])) {
            if ($test["usuario"]["tipo"] === "admin") {
                $datosCrear[] = $request->getParam("titulo");
                $datosCrear[] = $request->getParam("autor");
                $datosCrear[] = $request->getParam("descripcion");
                $datosCrear[] = $request->getParam("precio");
                $datosCrear[] = $request->getParam("portada");

                echo json_encode(crearLibro($datosCrear));
            } else {
                echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
            }
        } else {
            echo json_encode($test);
        }
    } else
        echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
});

$app->put('/actualizarLibro/{referencia}', function ($request) {

    $test = validateToken();
    if (is_array($test)) {
        if (isset($test["usuario"])) {
            if ($test["usuario"]["tipo"] === "admin") {
                $datosActualizar[] = $request->getParam("titulo");
                $datosActualizar[] = $request->getParam("autor");
                $datosActualizar[] = $request->getParam("descripcion");
                $datosActualizar[] = $request->getParam("precio");
                $datosActualizar[] = $request->getParam("portada");
                $datosActualizar[] = $request->getAttribute("referencia");

                echo json_encode(actualizarLibro($datosActualizar));
            } else {
                echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
            }
        } else {
            echo json_encode($test);
        }
    } else
        echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
});

$app->delete('/borrarLibro/{referencia}', function ($request) {

    $test = validateToken();
    if (is_array($test)) {
        if (isset($test["usuario"])) {
            if ($test["usuario"]["tipo"] === "admin") {
                $datosBorrar[] = $request->getAttribute("referencia");

                echo json_encode(borrarLibro($datosBorrar));
            } else {
                echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
            }
        } else {
            echo json_encode($test);
        }
    } else
        echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
});
/*
$app->put('/actualizarPortada/{referencia}', function ($request) {

    $test = validateToken();
    if (is_array($test)) {
        if (isset($test["usuario"])) {
            if ($test["usuario"]["tipo"] === "admin") {
                $datosActualizar[] = $request->getParam("portada");
                $datosActualizar[] = $request->getAttribute("referencia");

                echo json_encode(actualizarPortada($datosActualizar));
            } else {
                echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
            }
        } else {
            echo json_encode($test);
        }
    } else
        echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
});

$app->get('/repetido/{tabla}/{columna}/{valor}', function ($request) {

    $test = validateToken();
    if (is_array($test)) {
        if (isset($test["usuario"])) {
            if ($test["usuario"]["tipo"] === "admin") {
                $repetido[] = $request->getAttribute("tabla");
                $repetido[] = $request->getAttribute("columna");
                $repetido[] = $request->getAttribute("valor");

                echo json_encode(repetido($repetido));
            } else {
                echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
            }
        } else {
            echo json_encode($test);
        }
    } else
        echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
});
*/
$app->get('/obtenerLibro/{referencia}', function ($request) {

    $test = validateToken();
    if (is_array($test)) {
        if (isset($test["usuario"])) {
            if ($test["usuario"]["tipo"] === "admin") {
                $respuesta = obtenerLibro($request->getAttribute("referencia"));
                $respuesta["token"] = $test["token"];

                echo json_encode($respuesta);
            } else {
                echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
            }
        } else {
            echo json_encode($test);
        }
    } else
        echo json_encode(array("no_auth" => "No tienes permiso para usar el servicio"));
});

$app->run();

