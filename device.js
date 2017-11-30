class Device
{
	constructor(ers, erd, urs, urd, fmax, Nz, z, dz, width, height)
	{
		this.ers = ers;
		this.erd = erd;
		this.urs = urs;
		this.urd = urd;
		this.width = width;
		this.height = height;
		this.z = z;
		
		this.ER = Array(Nz).fill(ers);
		this.UR = Array(Nz).fill(urs);
		
		let w1 = Math.round(z - width/2);
		let w2 = Math.round(z + width/2);
		
		for(let i = w1; i < w2; i++)
		{
			this.ER[i] = erd;
			this.UR[i] = urd;
		}
		
		let c0  = 299792458;
		let nbc = Math.sqrt(this.UR[0]*this.ER[0]);
		let dt = nbc*dz/(2*c0);
		
		this.mEy = Array(Nz).fill(0);
		this.mHx = Array(Nz).fill(0);
		
		for(let i = 0; i < this.mEy.length; i++)
		{
			this.mEy[i] = (c0*dt)/this.ER[i];
		}
		
		for(let i = 0; i < this.mHx.length; i++)
		{
			this.mHx[i] = (c0*dt)/this.UR[i];
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
	
	Draw(context, y)
	{
		let w2 = Math.round(this.width/2);
		let h2 = Math.round(this.height/2);
		
		let x1 = this.z - w2;
		let y1 = y - h2;
		
		context.globalAlpha = 0.2;
		context.fillRect(x1, y1, this.width, this.height);
		context.globalAlpha = 1.0;
	}
}