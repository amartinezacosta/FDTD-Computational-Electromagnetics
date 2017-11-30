class Source
{
	constructor(Amplitude, Sigma, Standard_Deviation, Mean, Nz, za)
	{
		this.Amplitude = Amplitude;
		this.Sigma = Sigma;
		this.Standard_Deviation = Standard_Deviation;
		this.Variance = Math.pow(this.Standard_Deviation, 2);
		this.Mean = Mean;


		this.Source = Array(Nz).fill(0.0);
		for(let i=0; i < this.Source.length; i++)
		{
			let num = Math.pow((za[i] - this.Mean), 2);
			let den =  Math.pow((this.Variance*2), 2);
	
			this.Source[i] = this.Amplitude*Math.exp(-num/den);
		}
		
		this.Update = this.Source.length;
	}
	
	Inject(Er, z)
	{	
		if(this.Update < this.Source.length)
		{
			Er[z] = Er[z] + this.Source[this.Update++];
		}
	}
	
	GetSource()
	{
		return this.Source;
	}
	
	SetAmplitude(Amplitude, za)
	{
		this.Amplitude = Amplitude;
		for(let i=0; i < this.Source.length; i++)
		{
			let num = Math.pow((za[i] - this.Mean), 2);
			let den =  Math.pow((this.Variance*2), 2);
	
			this.Source[i] = this.Amplitude*Math.exp(-num/den);
		}
	}
	
	SetStandard(Standard_Deviation, za)
	{
		this.Standard_Deviation = Standard_Deviation;
		this.Variance = Math.pow(this.Standard_Deviation, 2);
		for(let i=0; i < this.Source.length; i++)
		{
			let num = Math.pow((za[i] - this.Mean), 2);
			let den =  Math.pow((this.Variance*2), 2);
	
			this.Source[i] = this.Amplitude*Math.exp(-num/den);
		}
	}
	
		
	SetMean(Mean, za)
	{
		this.Mean = Mean;
		for(let i=0; i < this.Source.length; i++)
		{
			let num = Math.pow((za[i] - this.Mean), 2);
			let den =  Math.pow((this.Variance*2), 2);
	
			this.Source[i] = this.Amplitude*Math.exp(-num/den);
		}
	}
	
	ResetUpdate()
	{
		this.Update = 0;
	}
}