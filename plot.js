function plot(context, x, y, x0, y0, c)
{
	if(x.length != y.length)
	{
		return 0;
	}
	
	context.beginPath();
	context.moveTo(x0, y0);
	for(let i = 0; i < x.length; i++)
	{
		context.lineTo(x0 + x[i], y0 - y[i]);
		context.moveTo(x0 + x[i], y0 - y[i]);
	}
	switch(c)
	{
		case "blue":
			context.strokeStyle = "red";
			break;
		case "red":
			context.strokeStyle = "blue";
			break;
		default:
			context.strokeStyle = "black";
			break;
	}
	
	context.stroke();
}