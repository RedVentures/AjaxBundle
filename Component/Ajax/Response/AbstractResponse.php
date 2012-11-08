<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Response;

abstract class AbstractResponse
{
	public function getName( )
	{
		return strtolower( str_replace( 'Response', '', substr( get_called_class( ), strrpos( get_called_class(), '\\' ) + 1 ) ) );
	}
}