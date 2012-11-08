<?php
namespace RedVentures\Bundle\AjaxBundle\Component\HttpFoundation;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use RedVentures\Bundle\AjaxBundle\Component\Ajax\Callback\AbstractCallback;
use RedVentures\Bundle\AjaxBundle\Component\Ajax\Response\AbstractResponse;

/**
 * Provides some basic helper methods for responding to the front-end application with ajax
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
class JsonResponse extends Response
{
	protected $callbacks = array();
	protected $payload;
	protected $type;

    /**
     * Constructor.
     *
     * @param string  $content The response content
     * @param integer $status  The response status code
     * @param array   $headers An array of response headers
     *
     * @api
     */
    public function __construct($payload = '', $status = 200, $headers = array())
    {
        $this->headers = new ResponseHeaderBag($headers);
        $this->setPayload($payload);
        $this->setStatusCode($status);
        $this->setProtocolVersion('1.0');
        if (!$this->headers->has('Date')) {
            $this->setDate(new \DateTime(null, new \DateTimeZone('UTC')));
        }

    	// Add a header for content-type
    	$this->headers->set('Content-Type', 'application/json');
    }

    /**
     * Sets the payload content
     *
     * @access public
     * @param mixed payload
     * @return void
     */
    public function setPayload( $payload )
    {

        // See if the payload is a response
        if ( $payload instanceof AbstractResponse ) {
            $this->payload = $payload->getContent();
            $this->type = $payload->getName();
        } else {
        	$this->payload = $payload;
        }
    }

    /**
     * Returns the payload
     *
     * @access public
     * @return mixed
     */
    public function getPayload( )
    {
    	return $this->payload;
    }

	/**
	 * This method adds a callback to the JSON response
	 *
	 * @access public
	 * @param AbstractCallback $callback
	 * @return void
	 */
	public function addCallback( AbstractCallback $callback )
	{
		$this->callbacks[] = $callback;
	}

    /**
     * Sends content for the current web response.
     */
    public function sendContent()
    {
        echo $this->getContent();
    }

	/**
	 * Return the content portion
	 *
	 * @access public
	 * @return string
	 */
	public function getContent( )
	{
		return json_encode( array( 'callbacks' => array_map( function( $callback ) { return $callback->getRepresentation(); }, $this->callbacks ), 'payload' => $this->getPayload(), 'type' => $this->type ) );
	}
}