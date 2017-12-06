class Device
{
	constructor(er, ur, width, height, position, dz)
	{
		this.er = er;
		this.ur = ur;
		this.position = position;
		this.width = width;
		this.height = height;
		
		
		/*c0 should be a global constant*/
		let c0  = 299792458;
		let nbc = Math.sqrt(er*ur);
		let dt = nbc*dz/(2*c0);
		
		this.mEy = Array(width).fill(0);
		this.mHx = Array(width).fill(0);
		
		for(let i = 0; i < this.mEy.length; i++)
		{
			this.mEy[i] = (c0*dt)/er;
		}
		
		for(let i = 0; i < this.mHx.length; i++)
		{
			this.mHx[i] = (c0*dt)/ur;
		}
	}
	
	GetElectric()
	{
		return this.ER;
	}
	
	GetMagnetic()
	{
		return this.UR;
	}
	
	GetmEy(index)
	{
		return this.mEy[index];
	}
	
	GetmHx(index)
	{
		return this.mHx[index];
	}
	
	GetWidth()
	{
		return this.width;
	}
	
	GetHeight()
	{
		return this.height;
	}
	
	
	AddDevice(Device)
	{
		let w1 = Math.round(Device.position - Device.width/2);
		let w2 = Math.round(Device.position + Device.width/2);
		let j = 0;
		
		for(let i = w1; i < w2; i++)
		{
			this.mEy[i] = Device.mEy[j];
			j++;
		}
	}
	
	Draw(context, y)
	{
		if(this.er > 1.0 || this.ur > 1.0)
		{
			let w2 = Math.round(this.width/2);
			let h2 = Math.round(this.height/2);
		
			let x1 = this.position - w2;
			let y1 = y - h2;
		
			context.globalAlpha = 0.4;
			context.fillRect(x1, y1, this.width, this.height);
			context.globalAlpha = 1.0;
		}
	}
}