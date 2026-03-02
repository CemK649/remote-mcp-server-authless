import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator",
		version: "1.0.0",
	});

	async init() {
		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			},
		);

		//Search Cargo Tool

    const { Cargo_Search_BASE_URL } = this.env;
    this.server.tool(
      "search_cargo",
      "Search all cargos with API",
      {CargoTrackingNumber:external_exports3.string()}, 
      async (CargoTrackingNumber) => {
        try {
          const baseUrl = Cargo_Search_BASE_URL ? Cargo_Search_BASE_URL.replace(/\/$/, "") : "";
          const response = await fetch(`${baseUrl}/CargoSearch/ArasKargoSearch`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({"CargoTrackingNumber":CargoTrackingNumber})
          });
          if (!response.ok) {
            return {
              content: [{ type: "text", text: `API Error: ${response.status} - Check if API key is valid.` }]
            };
          }
          const data = await response.json();
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: "text", text: `Connection Failed: ${errorMessage}` }]
          };
        }
      }
    );
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
