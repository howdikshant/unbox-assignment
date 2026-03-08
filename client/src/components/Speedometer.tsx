import ReactSpeedometer from "react-d3-speedometer";

type Props = {
    speed: number;
};

// gauge component — just wraps react-d3-speedometer with our config
// maxValue is 120 to match the server-side clamp range
export default function Speedometer({ speed }: Props) {
    return (
        <div style={{ width: "400px", margin: "auto" }}>
            <ReactSpeedometer
                maxValue={120}
                value={speed}
                needleColor="red"
                startColor="green"
                endColor="red"
            />
        </div>
    );
}