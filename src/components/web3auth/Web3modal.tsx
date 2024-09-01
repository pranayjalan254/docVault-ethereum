import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { useNavigate } from "react-router-dom";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";
import "./web3auth.css";
import { useAuth } from "../../AuthContext";

const clientId = import.meta.env.VITE_CLIENT_ID ?? "";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.sepolia.org",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorer: "https://sepolia.etherscan.io/",
  ticker: "ETH",
  tickerName: "Sepolia Ether",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
});

function Web3modal() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          const role = await getUserRole();
          if (role) {
            login();
            setUserType(role);
            navigate(
              role === "institution" ? "/insti-dashboard" : "/stud-dashboard"
            );
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };

    init();
  }, [navigate, login]);

  const handleLogin = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);

      if (web3auth.connected) {
        const role = await getUserRole();
        if (role) {
          login();
          setUserType(role);
          navigate(
            role === "institution" ? "/insti-dashboard" : "/stud-dashboard"
          );
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const getUserRole = async () => {
    return userType;
  };

  return (
    <div className="container">
      <div className="grid">
        {isAuthenticated ? (
          <div className="flex-container">
            <div></div>
            <div>
              <h1>Please refresh</h1>
            </div>
          </div>
        ) : (
          <div className="login-card">
            <h2 className="login-title">Login</h2>
            <div className="user-toggle">
              <button
                className={userType === "institution" ? "active" : ""}
                onClick={() => setUserType("institution")}
              >
                Institution
              </button>
              <button
                className={userType === "student" ? "active" : ""}
                onClick={() => setUserType("student")}
              >
                Credential Holder
              </button>
            </div>

            <button onClick={handleLogin} className="login-button">
              Login with Web3Auth
            </button>
          </div>
        )}
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </div>
  );
}

export default Web3modal;
