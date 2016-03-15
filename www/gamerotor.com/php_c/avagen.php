<?php
// Avatar generator
// URL format
// size=... width=... height=... set image Size/Width/Height
// bg=<hextcolor>
// format=png/jpg
// steps= draw script
// -x...: set current COLOR (rgb,rgba)
// -XYXYXY...: draw poligon. XY format: <WORD16><WORD16>, 256*256 field
// Example: http://gamerotor.com/php_c/avagen.php?size=100&steps=@faaf-aa-bb-00aaffbb&bg=1f3&format=png
define("DEBUG",0);

function chex2color($image, $cstr)
{
	if(!cstr){
		return NULL;
	}
	if(DEBUG > 0){
		echo "-chex2color [".$cstr."]<br>";
	};
	// rgb/rgba -> color
	$r = 255;
	$g = 255;
	$b = 255;
	$a = 255;
	$cmdlen = strlen($cstr);
	if($cmdlen == 3 || $cmdlen == 4){
		$r = hexdec(substr($cstr, 0, 1))*16;
		$g = hexdec(substr($cstr, 1, 1))*16;
		$b = hexdec(substr($cstr, 2, 1))*16;
	}
	if($cmdlen == 4){
		$a = hexdec(substr($cstr, 3, 1))*16;
	}
	if($cmdlen == 6 || $cmdlen == 8){
		$r = hexdec(substr($cstr, 0, 2));
		$g = hexdec(substr($cstr, 2, 2));
		$b = hexdec(substr($cstr, 4, 2));
	}
	if($cmdlen == 8){
		$a = hexdec(substr($cstr, 6, 2));
	}
	return imagecolorallocatealpha($image, $r, $g, $b, (255-$a)/2);
}

function parseUrlIntoImage($drawscript,$ww,$hh,$bgc,$transparent)
{
	$antialias_factor = 4;
	$drawscript = strtolower($drawscript);

	$ww_original = $ww;
	$hh_original = $hh;
	$ww = $ww*$antialias_factor;
	$hh = $hh*$antialias_factor;
	$image = imagecreatetruecolor($ww, $hh);
	$px_scale = $ww/0xff;
	$py_scale = $hh/0xff;
	$bgcolor = chex2color($image,$bgc);
	if($transparent){
		$bg = imagecolorallocatealpha($image, 255, 255, 255, 127);
		imagefill($image, 0, 0, $bg);
		imagesavealpha($image, true);
	}else{
		if(!$bgcolor){
			$bgcolor = imagecolorallocatealpha($image, 255, 255, 255, 0);
		}
	}
	if($bgcolor){
		imagefilledrectangle($image, 0, 0, $ww, $hh, $bgcolor);
	}
	// $a == 0 -> NOT transparent
	$currentColor = imagecolorallocatealpha($image, 0, 0, 0, 0);
	if(DEBUG > 0){
		echo "size: ".$ww_original."/".$hh_original."<br>";
		echo "drawscript: ".$drawscript."<br>";
	};
	// parsing commands
	$commands = preg_split("/[-]+/",$drawscript);//explode("-",$drawscript);
	foreach ($commands as $cmd) {
		if(DEBUG > 0){
			echo "cmd: ".$cmd."<br>";
		};
		$cmdlen = strlen($cmd);
		if($cmdlen < 2){
			continue;
		}
		if($cmd[0] == "x"){
			$currentColor = chex2color($image,substr($cmd,1));
		}else{
			if($cmdlen == 2){
				$cmd = $cmd[0].$cmd[0].$cmd[1].$cmd[1];
				$cmdlen = strlen($cmd);
			}
			if($cmdlen >= 4){
				$points = array();
				$pcnt = 0;
				for($pi = 0; $pi<$cmdlen;$pi += 4){
					$x = $px_scale*hexdec(substr($cmd,$pi,2));
					$y = $py_scale*hexdec(substr($cmd,$pi+2,2));
					$points[] = $x;
					$points[] = $y;
					$pcnt++;
					if(DEBUG > 0){
						echo "-point ".$x." ".$y."<br>";
					};
				}
				if($pcnt == 1){
					// square 1/16 width
					$points[] = $points[0]+$px_scale*16+1;
					$points[] = $points[1]+1;
					$pcnt++;
					$points[] = $points[0]+$px_scale*16+1;
					$points[] = $points[1]+$py_scale*16+1;
					$pcnt++;
					$points[] = $points[0]+1;
					$points[] = $points[1]+$py_scale*16+1;
					$pcnt++;
				}
				if($pcnt == 2){
					// AB-box
					$ab_l = $points[0];
					$ab_t = $points[1];
					$ab_r = $points[2];
					$ab_b = $points[3];
					$pcnt = 4;
					$points = array($ab_l,$ab_t,$ab_r,$ab_t,$ab_r,$ab_b,$ab_l,$ab_b);
				}
				if($pcnt >= 3){
					if(DEBUG > 0){
						echo "-closed with ".$pcnt." points<br>";//print_r($points);
					};
					imagefilledpolygon($image, $points, $pcnt, $currentColor);
				}
			}
		}
	}
	$image_aa = imagecreatetruecolor($ww_original,$hh_original);
	if($transparent){
		imagealphablending( $image_aa, false );
		imagesavealpha( $image_aa, true );
	}
	imagecopyresampled($image_aa,$image,0,0,0,0,$ww_original,$hh_original,$ww,$hh);
	return $image_aa;
}

// Detecting image size
$ww = 100;
$hh = 100;
if($_REQUEST['size']){
	$ww = $_REQUEST['size'];
	$hh = $_REQUEST['size'];
}
if($_REQUEST['width']){
	$ww = $_REQUEST['width'];
}
if($_REQUEST['height']){
	$hh = $_REQUEST['height'];
}
$script = $_REQUEST["steps"];
$fmt = $_REQUEST["format"];
$bgc = $_REQUEST["bg"];

// flush image
if($fmt == "png"){
	$image = parseUrlIntoImage($script, $ww, $hh, $bgc, true);
	if(DEBUG == 0){
		header('Content-type: image/png');
		imagepng($image);
	}
}else{
	$image = parseUrlIntoImage($script, $ww, $hh, $bgc, false);
	if(DEBUG == 0){
		header('Content-type: image/jpeg');
		imagejpeg($image, NULL, 100);
	}
}
imagedestroy($image);

?>
