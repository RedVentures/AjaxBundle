<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Response;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBag;

/**
 * This allows you to display a dialog triggered via a JSON response
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
class FlashResponse extends AbstractResponse
{
	protected $bag;
	
	/**
	 * Constructor method accepts the content of the dialog
	 *
	 * @access public
	 * @return void
	 */
	public function __construct( $bag, $content = null )
	{
		if ( $bag instanceof FlashBag ) {
			$this->setFlashBag( $bag );
		} else {
			$flash = new FlashBag();
			$flash->add( $bag, $content );
			$this->setFlashBag( $flash );
		}
	}

	/**
	 * Sets the content of the dialog
	 *
	 * @access public
	 * @param mixed $content
	 * @return void
	 */
	public function setFlashBag( FlashBag $bag )
	{
		$this->bag = $bag;
	}

	/**
	 * Prepares the parameters to pass back to the client
	 *
	 * @access protected
	 * @return array
	 */
	public function getContent( )
	{
		$returnArray = array();
		
		// Loop over all flashes
		foreach ( $this->bag->all() as $key=>$group ) {
			$returnArray[$key] = array();
			
			foreach ( $group as $k=>$flash ) {
				$returnArray[$key][] = $flash;
			}
		}

		// Loop over all children
		return $returnArray;
	}
}